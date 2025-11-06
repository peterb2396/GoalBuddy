import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AnimatedCheckbox from './AnimatedCheckbox';
import AnimatedProgressBar from './AnimatedProgressBar';
import { theme } from '../theme';

const SubItemCard = ({ item, goalColor, onUpdate, onShowConfetti }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editValue, setEditValue] = useState(item.currentValue?.toString() || '0');

  const handleCheckboxToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCheckedState = !item.isChecked;
    onUpdate({ ...item, isChecked: newCheckedState });
    
    if (newCheckedState) {
      onShowConfetti();
    }
  };

  const handleProgressUpdate = () => {
    const newValue = parseInt(editValue) || 0;
    const wasComplete = item.currentValue >= item.targetValue;
    const willBeComplete = newValue >= item.targetValue;
    
    onUpdate({ ...item, currentValue: newValue });
    
    if (!wasComplete && willBeComplete) {
      onShowConfetti();
    }
    
    setModalVisible(false);
  };

  const renderProgressModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Progress</Text>
          <Text style={styles.modalSubtitle}>{item.title}</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="Current value"
              placeholderTextColor={theme.colors.textLight}
            />
            <Text style={styles.inputSeparator}>/</Text>
            <Text style={styles.targetValue}>{item.targetValue}</Text>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton, { backgroundColor: goalColor }]}
              onPress={handleProgressUpdate}
            >
              <Text style={styles.saveButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {item.type === 'checkbox' ? (
          <>
            <AnimatedCheckbox
              checked={item.isChecked}
              onPress={handleCheckboxToggle}
              color={goalColor}
              size={28}
            />
            <Text style={[
              styles.title,
              item.isChecked && styles.completedTitle
            ]}>
              {item.title}
            </Text>
          </>
        ) : (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.title}>{item.title}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(true)}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={20} color={goalColor} />
              </TouchableOpacity>
            </View>
            <AnimatedProgressBar
              current={item.currentValue}
              target={item.targetValue}
              color={goalColor}
              height={20}
            />
          </View>
        )}
      </View>
      {item.type === 'progress' && renderProgressModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.cardBackground,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    flex: 1,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  editButton: {
    padding: theme.spacing.xs,
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
    width: '80%',
    ...theme.shadows.lg,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  modalSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  inputSeparator: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    marginHorizontal: theme.spacing.md,
  },
  targetValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
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
});

export default SubItemCard;
