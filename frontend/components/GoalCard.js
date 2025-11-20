import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import DraggableFlatList from 'react-native-draggable-flatlist';
import SubItemCard from './SubItemCard';
import { theme } from '../theme';

const GoalCard = ({ goal, onPress, onUpdateSubItem, onReorderSubItems, onShowConfetti }) => {
  const [expanded, setExpanded] = useState(false);
  
  const completedCount = goal.subItems.filter(item => {
    if (item.type === 'checkbox') return item.isChecked;
    return item.currentValue >= item.targetValue;
  }).length;
  
  const totalCount = goal.subItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  const handleReorder = ({ data }) => {
    const reorderedItems = data.map((item, index) => ({
      ...item,
      order: index
    }));
    onReorderSubItems(goal._id, reorderedItems);
  };

  const renderSubItem = ({ item, drag, isActive }) => (
    <TouchableOpacity 
      onLongPress={drag} 
      disabled={isActive}
      style={[styles.subItemWrapper, isActive && styles.draggingItem]}
    >
      <View style={styles.dragHandle}>
        <Ionicons name="menu" size={20} color={theme.colors.textLight} />
      </View>
      <View style={{ flex: 1 }}>
        <SubItemCard
          item={item}
          goalColor={goal.color}
          onUpdate={(updatedItem) => onUpdateSubItem(goal._id, updatedItem)}
          onShowConfetti={onShowConfetti}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      style={styles.container}
    >
      <TouchableOpacity
        style={[styles.header, { borderLeftColor: goal.color }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <View style={[styles.colorIndicator, { backgroundColor: goal.color }]} />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{goal.title}</Text>
              {goal.isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </View>
              )}
            </View>
            <View style={styles.metaRow}>
              <View style={[styles.typeBadge, 
                { backgroundColor: goal.type === 'discrete' ? theme.colors.secondary : theme.colors.accent2 }
              ]}>
                <Text style={styles.typeText}>
                  {goal.type === 'discrete' ? 'Discrete' : 'Continuous'}
                </Text>
              </View>
              {goal.type === 'continuous' && goal.resetFrequency && (
                <Text style={styles.resetText}>
                  Resets {goal.resetFrequency}
                </Text>
              )}
              {goal.sharedWith && goal.sharedWith.length > 0 && (
                <View style={styles.sharedBadge}>
                  <Ionicons name="people" size={12} color={theme.colors.primary} />
                  <Text style={styles.sharedText}>
                    {goal.sharedWith.length + 1}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount}
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={theme.colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarTrack}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${progress}%`,
                backgroundColor: goal.color 
              }
            ]} 
          />
        </View>
      </View>

      {/* Expanded sub-items */}
      {expanded && (
        <Animatable.View animation="fadeIn" duration={300} style={styles.subItemsContainer}>
          {goal.subItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={48} color={theme.colors.textLight} />
              <Text style={styles.emptyText}>No sub-items yet</Text>
              <Text style={styles.emptySubtext}>Tap the goal to add items</Text>
            </View>
          ) : (
            <DraggableFlatList
              data={goal.subItems.sort((a, b) => a.order - b.order)}
              onDragEnd={handleReorder}
              keyExtractor={(item) => item.id}
              renderItem={renderSubItem}
              scrollEnabled={false}
            />
          )}
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: goal.color }]}
            onPress={() => onPress(goal)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Goal</Text>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderLeftWidth: 4,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 4,
    height: 40,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  completedBadge: {
    marginLeft: theme.spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  typeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  resetText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  sharedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  sharedText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  progressText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  progressBarContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: theme.colors.progressBackground,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
  subItemsContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  subItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dragHandle: {
    paddingRight: theme.spacing.sm,
  },
  draggingItem: {
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  emptySubtext: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
});

export default GoalCard;
