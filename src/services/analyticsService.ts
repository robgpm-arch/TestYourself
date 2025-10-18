import { logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '../config/firebase';

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
}

export interface UserProperties {
  grade?: number;
  subscription_type?: string;
  preferred_subject?: string;
  user_level?: number;
}

export class AnalyticsService {
  /**
   * Track user authentication events
   */
  static trackSignUp(method: 'email' | 'google' | 'facebook') {
    if (!analytics) return;
    
    logEvent(analytics, 'sign_up', {
      method,
      timestamp: new Date().toISOString()
    });
  }

  static trackLogin(method: 'email' | 'google' | 'facebook') {
    if (!analytics) return;
    
    logEvent(analytics, 'login', {
      method,
      timestamp: new Date().toISOString()
    });
  }

  static trackLogout() {
    if (!analytics) return;
    
    logEvent(analytics, 'logout', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track quiz-related events
   */
  static trackQuizStart(quizId: string, quizTitle: string, subject: string, difficulty: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'quiz_start', {
      quiz_id: quizId,
      quiz_title: quizTitle,
      subject,
      difficulty,
      timestamp: new Date().toISOString()
    });
  }

  static trackQuizComplete(
    quizId: string,
    quizTitle: string,
    subject: string,
    score: number,
    maxScore: number,
    timeSpent: number,
    passed: boolean
  ) {
    if (!analytics) return;
    
    const percentage = (score / maxScore) * 100;
    
    logEvent(analytics, 'quiz_complete', {
      quiz_id: quizId,
      quiz_title: quizTitle,
      subject,
      score,
      max_score: maxScore,
      percentage,
      time_spent: timeSpent,
      passed,
      timestamp: new Date().toISOString()
    });
  }

  static trackQuizAbandon(quizId: string, questionsAnswered: number, timeSpent: number) {
    if (!analytics) return;
    
    logEvent(analytics, 'quiz_abandon', {
      quiz_id: quizId,
      questions_answered: questionsAnswered,
      time_spent: timeSpent,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track learning and engagement
   */
  static trackStudyMaterialView(materialId: string, materialType: string, subject: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'study_material_view', {
      material_id: materialId,
      material_type: materialType,
      subject,
      timestamp: new Date().toISOString()
    });
  }

  static trackLearningGoalSet(subject: string, targetScore: number, timeframe: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'learning_goal_set', {
      subject,
      target_score: targetScore,
      timeframe,
      timestamp: new Date().toISOString()
    });
  }

  static trackAchievementUnlocked(achievementId: string, achievementName: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'achievement_unlock', {
      achievement_id: achievementId,
      achievement_name: achievementName,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track subscription and monetization events
   */
  static trackSubscriptionPurchase(subscriptionType: 'pro' | 'premium', price: number) {
    if (!analytics) return;
    
    logEvent(analytics, 'purchase', {
      transaction_id: `sub_${Date.now()}`,
      value: price,
      currency: 'INR',
      item_category: 'subscription',
      item_name: `${subscriptionType}_subscription`,
      timestamp: new Date().toISOString()
    });
  }

  static trackSubscriptionCancel(subscriptionType: string, reason?: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'subscription_cancel', {
      subscription_type: subscriptionType,
      cancel_reason: reason,
      timestamp: new Date().toISOString()
    });
  }

  static trackPaymentMethodAdd(method: 'card' | 'upi' | 'wallet' | 'netbanking') {
    if (!analytics) return;
    
    logEvent(analytics, 'payment_method_add', {
      payment_method: method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track user engagement and app usage
   */
  static trackScreenView(screenName: string, screenClass?: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
      timestamp: new Date().toISOString()
    });
  }

  static trackFeatureUse(featureName: string, context?: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'feature_use', {
      feature_name: featureName,
      context,
      timestamp: new Date().toISOString()
    });
  }

  static trackSearchQuery(query: string, category?: string, resultsCount?: number) {
    if (!analytics) return;
    
    logEvent(analytics, 'search', {
      search_term: query,
      category,
      results_count: resultsCount,
      timestamp: new Date().toISOString()
    });
  }

  static trackShareContent(contentType: 'quiz' | 'achievement' | 'score', contentId: string, method: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'share', {
      content_type: contentType,
      content_id: contentId,
      method,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track performance and errors
   */
  static trackPerformance(metric: string, value: number, unit: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
      timestamp: new Date().toISOString()
    });
  }

  static trackError(errorType: string, errorMessage: string, context?: string) {
    if (!analytics) return;
    
    logEvent(analytics, 'app_error', {
      error_type: errorType,
      error_message: errorMessage,
      context,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Set user properties
   */
  static setUserData(userId: string, properties: UserProperties) {
    if (!analytics) return;
    
    setUserId(analytics, userId);
    setUserProperties(analytics, properties);
  }

  static updateUserLevel(level: number) {
    if (!analytics) return;
    
    setUserProperties(analytics, {
      user_level: level
    });

    logEvent(analytics, 'level_up', {
      level,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track custom events
   */
  static trackCustomEvent(event: AnalyticsEvent) {
    if (!analytics) return;
    
    logEvent(analytics, event.name, {
      ...event.parameters,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track app lifecycle events
   */
  static trackAppStart() {
    if (!analytics) return;
    
    logEvent(analytics, 'app_start', {
      timestamp: new Date().toISOString()
    });
  }

  static trackAppBackground() {
    if (!analytics) return;
    
    logEvent(analytics, 'app_background', {
      timestamp: new Date().toISOString()
    });
  }

  static trackAppForeground() {
    if (!analytics) return;
    
    logEvent(analytics, 'app_foreground', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Track user retention and cohort analysis
   */
  static trackRetentionMilestone(days: number) {
    if (!analytics) return;
    
    logEvent(analytics, 'retention_milestone', {
      days_since_signup: days,
      timestamp: new Date().toISOString()
    });
  }

  static trackFirstQuizComplete() {
    if (!analytics) return;
    
    logEvent(analytics, 'first_quiz_complete', {
      timestamp: new Date().toISOString()
    });
  }

  static trackFirstSubscription() {
    if (!analytics) return;
    
    logEvent(analytics, 'first_subscription', {
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Batch tracking for offline events
   */
  private static offlineEvents: AnalyticsEvent[] = [];

  static trackOfflineEvent(event: AnalyticsEvent) {
    this.offlineEvents.push(event);
    localStorage.setItem('analytics_offline_events', JSON.stringify(this.offlineEvents));
  }

  static flushOfflineEvents() {
    if (!analytics || this.offlineEvents.length === 0) return;

    this.offlineEvents.forEach(event => {
      logEvent(analytics, event.name, event.parameters);
    });

    this.offlineEvents = [];
    localStorage.removeItem('analytics_offline_events');
  }

  /**
   * Initialize analytics on app start
   */
  static initialize() {
    if (!analytics) return;

    // Load offline events
    const storedEvents = localStorage.getItem('analytics_offline_events');
    if (storedEvents) {
      try {
        this.offlineEvents = JSON.parse(storedEvents);
        this.flushOfflineEvents();
      } catch (error) {
        console.error('Error loading offline analytics events:', error);
        localStorage.removeItem('analytics_offline_events');
      }
    }

    // Track app start
    this.trackAppStart();

    console.log('Analytics initialized');
  }
}

export default AnalyticsService;