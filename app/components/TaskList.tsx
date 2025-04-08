import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Task } from '../types/Task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
}

export default function TaskList({ tasks, onTaskPress, onTaskComplete }: TaskListProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onPress={() => onTaskPress(item)}
            onComplete={() => onTaskComplete(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
}); 