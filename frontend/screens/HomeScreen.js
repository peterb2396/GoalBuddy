import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { goalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';
import GoalCard from '../components/GoalCard';
import * as Haptics from 'expo-haptics';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, logout } = useAuth();
  const confettiRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const loadGoals = async () => {
    try {
      const data = await goalsAPI.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
      Alert.alert('Error', 'Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

 
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ]
    );
  };

  const handleDeleteGoal = async (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalsAPI.deleteGoal(goalId);
              loadGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          }
        }
      ]
    );
  };

  const handleReorderSubItems = async (goalId, reorderedSubItems) => {
    const goalToUpdate = goals.find(g => g._id === goalId);
    if (!goalToUpdate) return;

    const updatedGoal = { ...goalToUpdate, subItems: reorderedSubItems };
    setGoals(goals.map(g => g._id === goalId ? updatedGoal : g));

    try {
      await goalsAPI.updateGoal(goalId, { subItems: reorderedSubItems });
    } catch (error) {
      console.error('Error reordering sub-items:', error);
      loadGoals();
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const handleShowConfetti = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    confettiRef.current?.start();
  };

  const handleReorderGoals = async ({ data }) => {
    const reorderedGoals = data.map((goal, index) => ({
      ...goal,
      order: index
    }));
    
    setGoals(reorderedGoals);
    
    try {
      const orderedIds = reorderedGoals.map(g => g._id);
      await goalsAPI.reorderGoals(orderedIds);
    } catch (error) {
      console.error('Error reordering goals:', error);
      loadGoals();
    }
  };


  const handleUpdateSubItem = async (goalId, updatedSubItem) => {
    try {
      // make a new subItems array with the updated sub-item, and update the goal with it
      const goalToUpdate = goals.find(g => g._id === goalId);
      if (!goalToUpdate) return;
      const updatedSubItems = goalToUpdate.subItems.map(si =>
        si.id === updatedSubItem.id ? updatedSubItem : si
      );
      const updatedGoal = { ...goalToUpdate, subItems: updatedSubItems };
      await goalsAPI.updateGoal(goalId, { subItems: updatedSubItems });

      
      setGoals(goals.map(g => g._id === goalId ? updatedGoal : g));
    } catch (error) {
      console.error('Error updating sub-item:', error);
    }
  };

  const renderGoal = ({ item, drag, isActive }) => (
    <TouchableOpacity 
      onLongPress={drag}
      disabled={isActive}
      activeOpacity={1}
      style={[isActive && styles.draggingCard]}
    >
      <View style={styles.dragIndicator}>
        <View style={styles.dragHandle}>
          <Ionicons name="menu" size={24} color={theme.colors.textLight} />
        </View>
      </View>
      <GoalCard
        goal={item}
        onPress={(goal) => navigation.navigate('EditGoal', { goal })}
        onUpdateSubItem={handleUpdateSubItem}
        onReorderSubItems={handleReorderSubItems}
        onShowConfetti={handleShowConfetti}
      />
    </TouchableOpacity>
  );

  const sortedGoals = goals.sort((a, b) => a.order - b.order);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="trophy-outline" size={80} color={theme.colors.textLight} />
      <Text style={styles.emptyTitle}>No Goals Yet</Text>
      <Text style={styles.emptyText}>
        Start your journey by creating your first goal!
      </Text>
      <TouchableOpacity
        style={styles.emptyButton}
        onPress={() => navigation.navigate('CreateGoal')}
      >
        <Ionicons name="add-circle" size={24} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Create Goal</Text>
      </TouchableOpacity>
    </View>
  );



  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name.substring(0, user?.name.indexOf(" "))}!</Text>
          <Text style={styles.subtitle}>Track your goals</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Settings')}
            style={styles.iconButton}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Friends')}
            style={styles.iconButton}
          >
            <Ionicons name="people-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      ) : (
        <View>
        <DraggableFlatList
          data={sortedGoals}
          onDragEnd={handleReorderGoals}
          keyExtractor={(item) => item._id}
          renderItem={renderGoal}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />

<ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: -20, y: 0 }}
        fadeOut={true}
        autoStart={false}
        colors={[
          theme.colors.primary,
          theme.colors.secondary,
          theme.colors.accent1,
          theme.colors.accent2,
          theme.colors.accent3,
          theme.colors.success
        ]}
      />

<SafeAreaView />

        </View>
      )}

      
      

      


      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateGoal')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  dragIndicator: {
    marginBottom: theme.spacing.xs,
  },
  dragHandle: {
    padding: theme.spacing.xs,
  },
  draggingCard: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  goalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  goalDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    minWidth: 40,
    textAlign: 'right',
  },
  goalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});