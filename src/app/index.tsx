import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  // El AuthGuard en _layout.tsx es quien decide.
  // Si no hay sesión, este loader salta directo a /welcome
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1115' }}>
      <ActivityIndicator size="large" color="#6B9EFA" />
    </View>
  );
}
