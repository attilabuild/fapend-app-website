// Define all navigation types for the app

export type RootStackParamList = {
  Main: undefined;
  Onboarding: undefined;
  Auth: undefined;
  PaywallScreen: undefined;
  CheckIn: undefined;
  RelapseFeedback: undefined;
  SuccessScreen: undefined;
  RelapseScreen: undefined;
  Settings: undefined;
  ResourceDetail: undefined;
  ArticleDetail: { id: string };
  ProfileEdit: undefined;
  EmergencyTools: undefined;
  MeditationTimer: undefined;
  UrgeTracker: undefined;
  NightRoutine: undefined;
  JournalEntry: undefined;
  NewPost: undefined;
  PostDetail: { id: string };
  UserProfile: { userId: string };
  ChatScreen: { chatId: string };
  History: undefined;
  AchievementsScreen: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  History: undefined;
  Library: undefined;
  Community: undefined;
  Journal: undefined;
  Learn: undefined;
}; 