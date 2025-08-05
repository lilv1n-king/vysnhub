import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import CreateProjectScreen from '../screens/CreateProjectScreen';

export type ProjectsStackParamList = {
  ProjectsList: undefined;
  ProjectDetail: { id: string };
  CreateProject: { productInfo?: { itemNumber: string; name: string; quantity: number } };
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
      <ProjectsStack.Screen 
        name="CreateProject" 
        component={CreateProjectScreen} 
      />
    </ProjectsStack.Navigator>
  );
}