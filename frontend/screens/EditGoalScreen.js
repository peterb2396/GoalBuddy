import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import uuid from 'react-native-uuid';
import { goalAPI } from '../services/api';
import { theme, accentColors } from '../theme';

const EditGoalScreen = ({ route, navigation }) => {
  const { goal } = route.params;

  const [title, setTitle] = useState(goal.title);
  const [type, setType] = useState(goal.type);
  const [resetFrequency, setResetFrequency] = useState(goal.resetFrequency || 'daily');
  const [color, setColor] = useState(goal.color);
  const [priority, setPriority] = useState(goal.priority);
  const [subItems, setSubItems] = useState(goal.subItems);
  const [showAddSubItemModal, setShowAddSubItemModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // New sub-item state
  const [newSubItemTitle, setNewSubItemTitle] = useState('');
  const [newSubItemType, setNewSubItemType] = useState('checkbox');
  const [newSubItemTarget, setNewSubItemTarget] = useState('100');

  const handleAddSubItem = () => {
    if (!newSubItemTitle.trim()) return;

    const newSubItem = {
      id: uuid.v4(),
      title: newSubItemTitle,
      type: newSubItemType,
      isChecked: false,
      currentValue: 0,
      targetValue: newSubItemType === 'progress' ? parseInt(newSubItemTarget) || 100 : 100,
      order: subItems.length,
    };

    setSubItems([...subItems, newSubItem]);
    setNewSubItemTitle('');
    setNewSubItemTarget('100');
    setShowAddSubItemModal(false);
  };

  const handleRemoveSubItem = (id) => {
    setSubItems(subItems.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a goal title');
      return;
    }

    try {
      const goalData = {
        title: title.trim(),
        type,
        resetFrequency: type === 'continuous' ? resetFrequency : null,
        color,
        priority,
        subItems,
      };

      await goalAPI.updateGoal(goal._id, goalData);
      navigation.goBack();
    } catch (error) {
      console.error('Error updating goal:', error);
      Alert.alert('Error', 'Failed to update goal. Please try again.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await goalAPI.deleteGoal(goal._id);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal. Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderAddSubItemModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showAddSubItemModal}
      onRequestClose={() => setShowAddSubItemModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add Sub-Item</Text>

          <TextInput
            style={styles.input}
            placeholder="Sub-item title"
            value={newSubItemTitle}
            onChangeText={setNewSubItemTitle}
            placeholderTextColor={theme.colors.textLight}
          />

          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                newSubItemType === 'checkbox' && styles.typeOptionSelected,
              ]}
              onPress={() => setNewSubItemType('checkbox')}
            >
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={newSubItemType === 'checkbox' ? color : theme.colors.textLight}
              />
              <Text style={styles.typeOptionText}>Checkbox</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                newSubItemType === 'progress' && styles.typeOptionSelected,
              ]}
              onPress={() => setNewSubItemType('progress')}
            >
              <Ionicons
                name="stats-chart"
                size={24}
                color={newSubItemType === 'progress' ? color : theme.colors.textLight}
              />
              <Text style={styles.typeOptionText}>Progress</Text>
            </TouchableOpacity>
          </View>

          {newSubItemType === 'progress' && (
            <View style={styles.targetInputContainer}>
              <Text style={styles.label}>Target Value:</Text>
              <TextInput
                style={styles.targetInput}
                value={newSubItemTarget}
                onChangeText={setNewSubItemTarget}
                keyboardType="numeric"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>
          )}

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowAddSubItemModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: color }]}
              onPress={handleAddSubItem}
            >
              <Text style={styles.saveButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderColorPicker = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showColorPicker}
      onRequestClose={() => setShowColorPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.colorPickerContent}>
          <Text style={styles.modalTitle}>Choose Color</Text>
          <View style={styles.colorGrid}>
            {accentColors.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorOption, { backgroundColor: c }]}
                onPress={() => {
                  setColor(c);
                  setShowColorPicker(false);
                }}
              >
                {color === c && (
                  <Ionicons name="checkmark" size={32} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Goal</Text>
        <TouchableOpacity onPress={handleSave} style={[styles.saveHeaderButton, { backgroundColor: color }]}>
          <Text style={styles.saveHeaderButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>Goal Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your goal"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={theme.colors.textLight}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Goal Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeOption, type === 'discrete' && styles.typeOptionSelected]}
              onPress={() => setType('discrete')}
            >
              <Ionicons
                name="flag"
                size={24}
                color={type === 'discrete' ? color : theme.colors.textLight}
              />
              <Text style={styles.typeOptionText}>Discrete</Text>
              <Text style={styles.typeDescription}>Complete once</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeOption, type === 'continuous' && styles.typeOptionSelected]}
              onPress={() => setType('continuous')}
            >
              <Ionicons
                name="infinite"
                size={24}
                color={type === 'continuous' ? color : theme.colors.textLight}
              />
              <Text style={styles.typeOptionText}>Continuous</Text>
              <Text style={styles.typeDescription}>Habit-based</Text>
            </TouchableOpacity>
          </View>
        </View>

        {type === 'continuous' && (
          <View style={styles.section}>
            <Text style={styles.label}>Reset Frequency</Text>
            <View style={styles.resetOptions}>
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.resetOption,
                    resetFrequency === freq && { backgroundColor: color },
                  ]}
                  onPress={() => setResetFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.resetOptionText,
                      resetFrequency === freq && styles.resetOptionTextSelected,
                    ]}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.colorSection}>
            <Text style={styles.label}>Color Theme</Text>
            <TouchableOpacity
              style={[styles.colorPreview, { backgroundColor: color }]}
              onPress={() => setShowColorPicker(true)}
            >
              <Ionicons name="color-palette" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.prioritySection}>
            <Text style={styles.label}>Priority Level</Text>
            <View style={styles.prioritySelector}>
              {[0, 1, 2, 3].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityOption,
                    priority === p && { backgroundColor: color },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      priority === p && styles.priorityTextSelected,
                    ]}
                  >
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.subItemsHeader}>
            <Text style={styles.label}>Sub-Items ({subItems.length})</Text>
            <TouchableOpacity
              style={[styles.addSubItemButton, { backgroundColor: color }]}
              onPress={() => setShowAddSubItemModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {subItems.map((item) => (
            <View key={item.id} style={styles.subItemCard}>
              <View style={styles.subItemInfo}>
                <Ionicons
                  name={item.type === 'checkbox' ? 'checkmark-circle-outline' : 'stats-chart-outline'}
                  size={24}
                  color={color}
                />
                <View style={styles.subItemText}>
                  <Text style={styles.subItemTitle}>{item.title}</Text>
                  {item.type === 'progress' && (
                    <Text style={styles.subItemMeta}>Target: {item.targetValue}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity onPress={() => handleRemoveSubItem(item.id)}>
                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>Delete Goal</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderAddSubItemModal()}
      {renderColorPicker()}
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
    backgroundColor: theme.colors.cardBackground,
    ...theme.shadows.sm,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  saveHeaderButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  saveHeaderButtonText: {
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
    fontSize: theme.fontSize.md,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  typeOption: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  typeOptionSelected: {
    borderColor: theme.colors.primary,
  },
  typeOptionText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
  },
  typeDescription: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  resetOptions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  resetOption: {
    flex: 1,
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resetOptionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  resetOptionTextSelected: {
    color: '#FFFFFF',
  },
  colorSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  prioritySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  priorityOption: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  priorityText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  priorityTextSelected: {
    color: '#FFFFFF',
  },
  subItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addSubItemButton: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subItemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  subItemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subItemText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  subItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  subItemMeta: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.error,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.md,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  targetInputContainer: {
    marginTop: theme.spacing.md,
  },
  targetInput: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.secondaryBackground,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  saveButton: {
    ...theme.shadows.sm,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  colorPickerContent: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '85%',
    ...theme.shadows.lg,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    justifyContent: 'center',
  },
  colorOption: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
});

export default EditGoalScreen;
