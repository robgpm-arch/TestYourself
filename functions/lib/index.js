"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindDevice = exports.registrySync = exports.syncMediums = exports.runSync = exports.onQuizResult = exports.onUserWrite = exports.api = exports.processScheduledNotifications = exports.sendPushNotification = exports.scheduleQuizReminder = exports.scheduleStudyReminders = exports.sendWelcomeNotification = exports.createSubscription = exports.updateLeaderboards = exports.calculateQuizResults = exports.createUserProfile = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-functions/v2/firestore");
const firestore_2 = require("firebase-admin/firestore");
const recaptcha_enterprise_1 = require("@google-cloud/recaptcha-enterprise");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const registrySync_1 = require("./registrySync");
Object.defineProperty(exports, "registrySync", { enumerable: true, get: function () { return registrySync_1.registrySync; } });
const bindDevice_1 = require("./bindDevice");
Object.defineProperty(exports, "bindDevice", { enumerable: true, get: function () { return bindDevice_1.bindDevice; } });
// Firebase Admin is auto-initialized in v2 functions
const db = (0, firestore_2.getFirestore)();
// Initialize reCAPTCHA Enterprise client
const PROJECT_ID = 'testyourself-80a10';
const SITE_KEY = '6LdOm9srAAAAADXULxCr-RzT005Z66eFJa8cbF0C';
const recaptchaClient = new recaptcha_enterprise_1.RecaptchaEnterpriseServiceClient();
// Express app for API routes
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
/**
 * USER MANAGEMENT FUNCTIONS
 */
// Create user profile after authentication
exports.createUserProfile = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid } = request.auth;
    const { displayName, email } = request.data;
    try {
        const userProfile = {
            uid,
            email,
            displayName,
            createdAt: new Date(),
            updatedAt: new Date(),
            profile: {
                firstName: (displayName === null || displayName === void 0 ? void 0 : displayName.split(' ')[0]) || '',
                lastName: (displayName === null || displayName === void 0 ? void 0 : displayName.split(' ')[1]) || '',
                achievements: [],
                badges: []
            },
            stats: {
                totalQuizzesCompleted: 0,
                totalQuestionsAnswered: 0,
                correctAnswers: 0,
                accuracy: 0,
                totalTimeSpent: 0,
                streakCurrent: 0,
                streakBest: 0,
                level: 1,
                experiencePoints: 0,
                favoriteSubjects: [],
                averageScore: 0
            }
        };
        await db.collection('users').doc(uid).set(userProfile);
        return { success: true, data: userProfile };
    }
    catch (error) {
        console.error('Error creating user profile:', error);
        throw new https_1.HttpsError('internal', 'Failed to create user profile');
    }
});
/**
 * QUIZ MANAGEMENT FUNCTIONS
 */
// Calculate quiz results and update user stats
exports.calculateQuizResults = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid } = request.auth;
    const { quizId, answers, timeSpent } = request.data;
    try {
        // Get quiz data
        const quizDoc = await db.collection('quizzes').doc(quizId).get();
        if (!quizDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Quiz not found');
        }
        const quiz = quizDoc.data();
        const questions = quiz.questions;
        // Calculate results
        let correctAnswers = 0;
        let totalScore = 0;
        const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
        const processedAnswers = answers.map((answer, index) => {
            const question = questions[index];
            const isCorrect = answer.answer === question.correctAnswer;
            if (isCorrect) {
                correctAnswers++;
                totalScore += question.points;
            }
            return {
                questionId: question.id,
                answer: answer.answer,
                isCorrect,
                timeSpent: answer.timeSpent || 0,
                hintsUsed: answer.hintsUsed || 0
            };
        });
        const percentage = (totalScore / maxScore) * 100;
        const passed = percentage >= quiz.passingScore;
        // Create quiz attempt record
        const attemptData = {
            quizId,
            userId: uid,
            startTime: new Date(Date.now() - timeSpent * 1000),
            endTime: new Date(),
            duration: timeSpent,
            score: totalScore,
            percentage,
            passed,
            answers: processedAnswers,
            status: 'completed'
        };
        const attemptRef = await db.collection('quiz_attempts').add(attemptData);
        // Update user stats
        await updateUserStats(uid, {
            totalQuestions: questions.length,
            correctAnswers,
            timeSpent,
            score: totalScore,
            subject: quiz.subject
        });
        // Update quiz stats
        await updateQuizStats(quizId, totalScore, maxScore);
        return {
            success: true,
            data: {
                attemptId: attemptRef.id,
                score: totalScore,
                maxScore,
                percentage,
                passed,
                correctAnswers,
                totalQuestions: questions.length
            }
        };
    }
    catch (error) {
        console.error('Error calculating quiz results:', error);
        throw new https_1.HttpsError('internal', 'Failed to calculate quiz results');
    }
});
/**
 * LEADERBOARD FUNCTIONS
 */
// Update leaderboards when quiz is completed
exports.updateLeaderboards = (0, firestore_1.onDocumentCreated)('quiz_attempts/{attemptId}', async (event) => {
    var _a, _b;
    const attemptData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!attemptData)
        return;
    const { userId, quizId, percentage } = attemptData;
    try {
        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();
        // Get quiz data for subject
        const quizDoc = await db.collection('quizzes').doc(quizId).get();
        const quizData = quizDoc.data();
        if (!userData || !quizData)
            return;
        const leaderboardEntry = {
            userId,
            username: userData.displayName || userData.email,
            avatar: ((_b = userData.profile) === null || _b === void 0 ? void 0 : _b.avatar) || null,
            score: percentage,
            subject: quizData.subject,
            updatedAt: new Date()
        };
        // Update different leaderboard periods
        const periods = ['daily', 'weekly', 'monthly', 'all-time'];
        for (const period of periods) {
            const leaderboardRef = db.collection('leaderboards')
                .doc(`${period}_${quizData.subject}_${userId}`);
            await leaderboardRef.set({
                ...leaderboardEntry,
                period
            }, { merge: true });
        }
    }
    catch (error) {
        console.error('Error updating leaderboards:', error);
    }
});
/**
 * SUBSCRIPTION AND PAYMENT FUNCTIONS
 */
// Handle subscription creation
exports.createSubscription = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid } = request.auth;
    const { priceId } = request.data;
    try {
        // This would integrate with your payment provider (Stripe, Razorpay, etc.)
        // For now, we'll create a basic subscription record
        const subscription = {
            userId: uid,
            type: priceId === 'price_pro' ? 'pro' : 'premium',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            autoRenew: true,
            priceId,
            createdAt: new Date()
        };
        // Update user subscription
        await db.collection('users').doc(uid).update({
            subscription,
            updatedAt: new Date()
        });
        return { success: true, data: subscription };
    }
    catch (error) {
        console.error('Error creating subscription:', error);
        throw new https_1.HttpsError('internal', 'Failed to create subscription');
    }
});
/**
 * NOTIFICATION FUNCTIONS
 */
// Send welcome notification to new users
exports.sendWelcomeNotification = (0, firestore_1.onDocumentCreated)('users/{userId}', async (event) => {
    var _a;
    const userData = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    const userId = event.params.userId;
    if (!userData)
        return;
    try {
        const notification = {
            userId,
            type: 'system',
            title: 'Welcome to TestYourself! 🎉',
            message: `Hi ${userData.displayName || 'there'}! Get started by taking your first quiz and track your learning progress.`,
            read: false,
            createdAt: new Date()
        };
        await db.collection('notifications').add(notification);
    }
    catch (error) {
        console.error('Error sending welcome notification:', error);
    }
});
/**
 * SCHEDULED NOTIFICATION FUNCTIONS
 */
// Schedule daily study reminders
exports.scheduleStudyReminders = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid } = request.auth;
    const { reminderTime, frequency } = request.data;
    try {
        // Store scheduled notification in Firestore
        const scheduledNotification = {
            userId: uid,
            type: 'study_reminder',
            title: 'Study Time! 📖',
            message: 'Keep up your learning streak! Time to study.',
            scheduledFor: new Date(reminderTime),
            frequency: frequency || 'daily',
            active: true,
            createdAt: new Date()
        };
        await db.collection('scheduled_notifications').add(scheduledNotification);
        return { success: true, message: 'Study reminder scheduled successfully' };
    }
    catch (error) {
        console.error('Error scheduling study reminder:', error);
        throw new https_1.HttpsError('internal', 'Failed to schedule study reminder');
    }
});
// Schedule quiz reminders
exports.scheduleQuizReminder = (0, https_1.onCall)(async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { uid } = request.auth;
    const { quizId, reminderTime, quizTitle } = request.data;
    try {
        const scheduledNotification = {
            userId: uid,
            type: 'quiz_reminder',
            title: 'Quiz Reminder 📚',
            message: `Time to take "${quizTitle}"!`,
            scheduledFor: new Date(reminderTime),
            data: { quizId },
            active: true,
            createdAt: new Date()
        };
        await db.collection('scheduled_notifications').add(scheduledNotification);
        return { success: true, message: 'Quiz reminder scheduled successfully' };
    }
    catch (error) {
        console.error('Error scheduling quiz reminder:', error);
        throw new https_1.HttpsError('internal', 'Failed to schedule quiz reminder');
    }
});
// Send push notification
exports.sendPushNotification = (0, https_1.onCall)(async (request) => {
    var _a, _b;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { targetUserId, title, body, data, imageUrl } = request.data;
    try {
        // Get user's FCM token
        const userDoc = await db.collection('users').doc(targetUserId).get();
        const userData = userDoc.data();
        if (!((_b = (_a = userData === null || userData === void 0 ? void 0 : userData.preferences) === null || _a === void 0 ? void 0 : _a.notifications) === null || _b === void 0 ? void 0 : _b.fcmToken)) {
            throw new https_1.HttpsError('not-found', 'User FCM token not found');
        }
        const message = {
            token: userData.preferences.notifications.fcmToken,
            notification: {
                title,
                body,
                imageUrl
            },
            data: data || {},
            android: {
                notification: {
                    icon: 'ic_notification',
                    color: '#3b82f6',
                    sound: 'default',
                    clickAction: 'FLUTTER_NOTIFICATION_CLICK'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: 'default',
                        badge: 1
                    }
                }
            }
        };
        void message; // placeholder for future use
        // Send using Firebase Admin SDK (you'll need to import and configure)
        // const response = await admin.messaging().send(message);
        // For now, store as in-app notification
        await db.collection('notifications').add({
            userId: targetUserId,
            type: (data === null || data === void 0 ? void 0 : data.type) || 'general',
            title,
            message: body,
            data: data || {},
            read: false,
            createdAt: new Date()
        });
        return { success: true, message: 'Notification sent successfully' };
    }
    catch (error) {
        console.error('Error sending push notification:', error);
        throw new https_1.HttpsError('internal', 'Failed to send push notification');
    }
});
// Process scheduled notifications (run every minute)
exports.processScheduledNotifications = (0, https_1.onCall)(async (request) => {
    try {
        const now = new Date();
        const scheduledQuery = await db.collection('scheduled_notifications')
            .where('active', '==', true)
            .where('scheduledFor', '<=', now)
            .get();
        const batch = db.batch();
        const notifications = [];
        for (const doc of scheduledQuery.docs) {
            const data = doc.data();
            // Create notification
            const notification = {
                userId: data.userId,
                type: data.type,
                title: data.title,
                message: data.message,
                data: data.data || {},
                read: false,
                createdAt: new Date()
            };
            notifications.push(notification);
            // Add to batch
            const notificationRef = db.collection('notifications').doc();
            batch.set(notificationRef, notification);
            // Update scheduled notification
            if (data.frequency === 'daily') {
                // Reschedule for next day
                const nextDay = new Date(data.scheduledFor);
                nextDay.setDate(nextDay.getDate() + 1);
                batch.update(doc.ref, { scheduledFor: nextDay });
            }
            else if (data.frequency === 'weekly') {
                // Reschedule for next week
                const nextWeek = new Date(data.scheduledFor);
                nextWeek.setDate(nextWeek.getDate() + 7);
                batch.update(doc.ref, { scheduledFor: nextWeek });
            }
            else {
                // One-time notification, deactivate
                batch.update(doc.ref, { active: false, processedAt: new Date() });
            }
        }
        await batch.commit();
        return {
            success: true,
            processed: notifications.length,
            notifications: notifications.map(n => ({ type: n.type, userId: n.userId }))
        };
    }
    catch (error) {
        console.error('Error processing scheduled notifications:', error);
        throw new https_1.HttpsError('internal', 'Failed to process scheduled notifications');
    }
});
/**
 * UTILITY FUNCTIONS
 */
async function updateUserStats(userId, quizResult) {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists)
        return;
    const userData = userDoc.data();
    const currentStats = userData.stats || {};
    const newTotalQuestions = (currentStats.totalQuestionsAnswered || 0) + quizResult.totalQuestions;
    const newCorrectAnswers = (currentStats.correctAnswers || 0) + quizResult.correctAnswers;
    const newAccuracy = (newCorrectAnswers / newTotalQuestions) * 100;
    const updatedStats = {
        ...currentStats,
        totalQuizzesCompleted: (currentStats.totalQuizzesCompleted || 0) + 1,
        totalQuestionsAnswered: newTotalQuestions,
        correctAnswers: newCorrectAnswers,
        accuracy: newAccuracy,
        totalTimeSpent: (currentStats.totalTimeSpent || 0) + quizResult.timeSpent,
        experiencePoints: (currentStats.experiencePoints || 0) + quizResult.score
    };
    // Add subject to favorites if not already there
    const favoriteSubjects = currentStats.favoriteSubjects || [];
    if (!favoriteSubjects.includes(quizResult.subject)) {
        favoriteSubjects.push(quizResult.subject);
    }
    updatedStats.favoriteSubjects = favoriteSubjects;
    await userRef.update({
        stats: updatedStats,
        updatedAt: new Date()
    });
}
async function updateQuizStats(quizId, score, maxScore) {
    const quizRef = db.collection('quizzes').doc(quizId);
    const quizDoc = await quizRef.get();
    if (!quizDoc.exists)
        return;
    const quizData = quizDoc.data();
    const currentAttempts = quizData.attempts || 0;
    const currentAverageScore = quizData.averageScore || 0;
    const newAttempts = currentAttempts + 1;
    const scorePercentage = (score / maxScore) * 100;
    const newAverageScore = ((currentAverageScore * currentAttempts) + scorePercentage) / newAttempts;
    await quizRef.update({
        attempts: newAttempts,
        averageScore: newAverageScore,
        updatedAt: new Date()
    });
}
/**
 * API ROUTES
 */
/**
 * Score a reCAPTCHA Enterprise token for risk assessment.
 */
async function scoreRecaptchaToken(token, action = 'admin_access') {
    var _a, _b;
    const parent = recaptchaClient.projectPath(PROJECT_ID);
    const [assessment] = await recaptchaClient.createAssessment({
        parent,
        assessment: {
            event: { token, siteKey: SITE_KEY },
        },
    });
    // Validate token
    const props = assessment.tokenProperties;
    if (!props.valid) {
        throw new Error(`Invalid token: ${props.invalidReason}`);
    }
    if (props.action !== action) {
        throw new Error(`Action mismatch. Expected "${action}", got "${props.action}"`);
    }
    const score = (_b = (_a = assessment.riskAnalysis) === null || _a === void 0 ? void 0 : _a.score) !== null && _b !== void 0 ? _b : 0;
    // Optional: assessment.riskAnalysis?.reasons for logging
    return score; // 0.0 (bad) → 1.0 (good)
}
// reCAPTCHA Enterprise verification endpoint
app.post('/verify-recaptcha', async (req, res) => {
    try {
        const { token, action } = req.body;
        if (!token || !action) {
            return res.status(400).json({ ok: false, error: 'Missing token/action' });
        }
        const score = await scoreRecaptchaToken(token, action);
        // Risk score (0.0–1.0). Choose your threshold.
        const allowed = score >= 0.5; // tune as needed
        return res.status(200).json({ ok: allowed, score });
    }
    catch (error) {
        console.error('verify-recaptcha error:', error.message);
        return res.status(200).json({
            ok: false,
            reason: error.message.includes('Invalid token') ? 'invalid-token' :
                error.message.includes('Action mismatch') ? 'action-mismatch' :
                    'assessment-failed'
        });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});
// Export the API
exports.api = (0, https_1.onRequest)(app);
/**
 * USER PROFILE SYNC FUNCTIONS
 */
// Sync users_public when user profile is created/updated
exports.onUserWrite = (0, firestore_1.onDocumentWritten)('users/{uid}', async (event) => {
    var _a;
    const uid = event.params.uid;
    const after = ((_a = event.data) === null || _a === void 0 ? void 0 : _a.after.exists) ? event.data.after.data() : null;
    const pubRef = db.doc(`users_public/${uid}`);
    if (!after) {
        await pubRef.delete().catch(() => { });
        return;
    }
    const pub = {
        uid,
        displayName: after.fullName || 'User',
        avatar: after.photoURL || null,
        state: after.state || null,
        district: after.district || null,
        updatedAt: firestore_2.FieldValue.serverTimestamp(),
    };
    await pubRef.set(pub, { merge: true });
});
/**
 * QUIZ RESULT & LEADERBOARD FUNCTIONS
 */
function computeBuckets(r) {
    const buckets = ['global'];
    if (r.state)
        buckets.push(`state:${r.state}`);
    if (r.state && r.district)
        buckets.push(`district:${r.state}-${r.district}`);
    if (r.courseId)
        buckets.push(`course:${r.courseId}`);
    if (r.courseId && r.subjectId)
        buckets.push(`subject:${r.courseId}|${r.subjectId}`);
    if (r.boardId)
        buckets.push(`board:${r.boardId}`);
    if (r.examId)
        buckets.push(`exam:${r.examId}`);
    return buckets;
}
// Maintain leaderboards when quiz results are created
exports.onQuizResult = (0, firestore_1.onDocumentCreated)('quiz_results/{runId}', async (event) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const r = (_a = event.data) === null || _a === void 0 ? void 0 : _a.data();
    if (!(r === null || r === void 0 ? void 0 : r.uid))
        return;
    const uid = r.uid;
    const pubSnap = await db.doc(`users_public/${uid}`).get();
    const pub = pubSnap.data() || { displayName: 'User', avatar: null, state: null, district: null };
    const buckets = computeBuckets(r);
    const batch = db.batch();
    for (const b of buckets) {
        const ref = db.doc(`leaderboards/${b}/entries/${uid}`);
        const cur = (await ref.get()).data();
        const nextScore = Math.max(Number((_b = r.score) !== null && _b !== void 0 ? _b : 0), Number((_c = cur === null || cur === void 0 ? void 0 : cur.score) !== null && _c !== void 0 ? _c : 0));
        batch.set(ref, {
            uid,
            displayName: pub.displayName,
            avatar: (_d = pub.avatar) !== null && _d !== void 0 ? _d : null,
            state: (_e = pub.state) !== null && _e !== void 0 ? _e : null,
            district: (_f = pub.district) !== null && _f !== void 0 ? _f : null,
            score: nextScore,
            total: ((_g = cur === null || cur === void 0 ? void 0 : cur.total) !== null && _g !== void 0 ? _g : 0) + 1,
            updatedAt: firestore_2.FieldValue.serverTimestamp(),
        }, { merge: true });
    }
    await batch.commit();
});
/**
 * SYNC CENTER FUNCTIONS
 */
exports.runSync = (0, https_1.onCall)(async (req) => {
    var _a, _b;
    if (!((_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin))
        throw new https_1.HttpsError("permission-denied", "Admin only");
    const { collections = [] } = req.data || {};
    const result = {};
    const errors = [];
    for (const col of collections) {
        if (!["mediums", "boards", "exams", "courses", "subjects", "chapters", "screens", "themes", "leaderboard_configs"].includes(col))
            continue;
        try {
            const filePath = path_1.default.join(__dirname, `../registries/${col}.json`);
            const buf = fs_1.default.readFileSync(filePath, 'utf8');
            const items = JSON.parse(buf);
            const batch = db.batch();
            items.forEach((doc) => {
                const ref = db.collection(col).doc(doc.id);
                batch.set(ref, { ...doc, updatedAt: firestore_2.FieldValue.serverTimestamp() }, { merge: true });
            });
            await batch.commit();
            result[col] = items.length;
        }
        catch (error) {
            console.error(`Error syncing ${col}:`, error);
            errors.push(`${col}: ${error.message}`);
        }
    }
    return { ok: errors.length === 0, indexed: result, errors };
});
// Sync mediums to admin panel
const MEDIUMS_REGISTRY = [
    { id: "english", title: "English", code: "EN", active: true, order: 1 },
    { id: "hindi", title: "Hindi", code: "HN", active: true, order: 2 }
];
exports.syncMediums = (0, https_1.onCall)(async (req) => {
    var _a, _b;
    if (!((_b = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.token) === null || _b === void 0 ? void 0 : _b.admin))
        throw new https_1.HttpsError("permission-denied", "Admin only");
    const batch = db.batch();
    MEDIUMS_REGISTRY.forEach((medium) => {
        const ref = db.collection("mediums").doc(medium.id);
        batch.set(ref, { ...medium, updatedAt: firestore_2.FieldValue.serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    return { ok: true, synced: MEDIUMS_REGISTRY.length };
});
//# sourceMappingURL=index.js.map