import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';
import { goalAPI } from '../services/api';
import GoalCard from '../components/GoalCard';
import { theme } from '../theme';

const HomeScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const confettiRef = useRef(null);

  useEffect(() => {
    loadGoals();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadGoals();
    });
    return unsubscribe;
  }, [navigation]);

  const loadGoals = async () => {
    try {
      const data = await goalAPI.getAllGoals();
      setGoals(data);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      await goalAPI.reorderGoals(orderedIds);
    } catch (error) {
      console.error('Error reordering goals:', error);
      loadGoals();
    }
  };

  const handleUpdateSubItem = async (goalId, updatedSubItem) => {
    try {
      const updatedGoal = await goalAPI.updateSubItem(goalId, updatedSubItem.id, updatedSubItem);
      setGoals(goals.map(g => g._id === goalId ? updatedGoal : g));
    } catch (error) {
      console.error('Error updating sub-item:', error);
    }
  };

  const handleReorderSubItems = async (goalId, reorderedSubItems) => {
    const goalToUpdate = goals.find(g => g._id === goalId);
    if (!goalToUpdate) return;

    const updatedGoal = { ...goalToUpdate, subItems: reorderedSubItems };
    setGoals(goals.map(g => g._id === goalId ? updatedGoal : g));

    try {
      await goalAPI.updateGoal(goalId, { subItems: reorderedSubItems });
    } catch (error) {
      console.error('Error reordering sub-items:', error);
      loadGoals();
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

  const sortedGoals = goals.sort((a, b) => a.order - b.order);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Goals</Text>
          <Text style={styles.headerSubtitle}>
            {goals.length} {goals.length === 1 ? 'goal' : 'goals'} • Keep pushing forward!
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateGoal')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading goals...</Text>
        </View>
      ) : (
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
      )}

      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: 0, y: 0 }}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
  },
  dragIndicator: {
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  dragHandle: {
    padding: theme.spacing.xs,
  },
  draggingCard: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  emptyButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});

export default HomeScreen;
