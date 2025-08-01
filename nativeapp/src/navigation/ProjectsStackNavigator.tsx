import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { id: string };
};

const ProjectsStack = createStackNavigator<ProjectsStackParamList>();

export default function ProjectsStackNavigator() {
  return (
    <ProjectsStack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#ffffff' }
      }}
    >
      <ProjectsStack.Screen 
        name="ProjectsList" 
        component={ProjectsScreen} 
      />
      <ProjectsStack.Screen 
        name="ProjectDetail" 
        component={ProjectDetailScreen} 
      />
    </ProjectsStack.Navigator>
  );
}