import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Calendar, MapPin, Users, Clock, CheckCircle } from 'lucide-react-native';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledScrollView = styled(ScrollView);
const StyledTouchableOpacity = styled(TouchableOpacity);

const mockProjectDetails = {
  '1': {
    id: '1',
    name: 'Office Building Renovation',
    location: 'Berlin, Germany',
    status: 'In Progress',
    startDate: '2025-02-01',
    endDate: '2025-04-30',
    team: 4,
    description: 'Complete lighting retrofit for 5-story office building with LED technology to improve energy efficiency and workplace lighting quality.',
    tasks: [
      { id: '1', name: 'Site survey and assessment', completed: true },
      { id: '2', name: 'Lighting design proposal', completed: true },
      { id: '3', name: 'Product selection and ordering', completed: false },
      { id: '4', name: 'Installation planning', completed: false },
      { id: '5', name: 'Installation execution', completed: false },
      { id: '6', name: 'Testing and commissioning', completed: false },
    ],
    progress: 33,
  },
  '2': {
    id: '2',
    name: 'Hotel Lobby Lighting',
    location: 'Munich, Germany',
    status: 'Planning',
    startDate: '2025-03-15',
    endDate: '2025-05-20',
    team: 2,
    description: 'Luxury hotel lobby ambient and accent lighting design with focus on creating welcoming atmosphere.',
    tasks: [
      { id: '1', name: 'Client requirements gathering', completed: true },
      { id: '2', name: 'Space analysis', completed: false },
      { id: '3', name: 'Lighting concept development', completed: false },
      { id: '4', name: 'Product specification', completed: false },
    ],
    progress: 25,
  },
  '3': {
    id: '3',
    name: 'Warehouse LED Upgrade',
    location: 'Hamburg, Germany',
    status: 'Completed',
    startDate: '2024-12-01',
    endDate: '2025-01-15',
    team: 6,
    description: 'Industrial LED lighting installation for 10,000 sqm warehouse, replacing old fluorescent fixtures.',
    tasks: [
      { id: '1', name: 'Site survey', completed: true },
      { id: '2', name: 'Design approval', completed: true },
      { id: '3', name: 'Equipment procurement', completed: true },
      { id: '4', name: 'Installation', completed: true },
      { id: '5', name: 'Testing and handover', completed: true },
    ],
    progress: 100,
  },
};

export default function ProjectDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params as { id: string };
  const project = mockProjectDetails[id as keyof typeof mockProjectDetails];

  if (!project) {
    return (
      <StyledView className="flex-1 bg-white">
        <StyledView className="flex-row items-center p-4 border-b border-gray-200">
          <StyledTouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#000" />
          </StyledTouchableOpacity>
          <StyledText className="text-lg font-semibold">Project Details</StyledText>
        </StyledView>
        
        <StyledView className="flex-1 justify-center items-center">
          <StyledText className="text-gray-600">Project not found</StyledText>
        </StyledView>
      </StyledView>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planning': return 'bg-yellow-100 text-yellow-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StyledView className="flex-1 bg-white">
      {/* Custom Header */}
      <StyledView className="flex-row items-center p-4 border-b border-gray-200">
        <StyledTouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color="#000" />
        </StyledTouchableOpacity>
        <StyledText className="text-lg font-semibold">Project Details</StyledText>
      </StyledView>
      
      <StyledScrollView className="flex-1">
        <StyledView className="p-4">
          
          {/* Project Header */}
          <Card className="mb-6">
            <CardContent>
              <StyledView className="flex-row justify-between items-start mb-4">
                <StyledView className="flex-1">
                  <StyledText className="text-2xl font-bold text-black mb-2">
                    {project.name}
                  </StyledText>
                  <StyledView className={`px-3 py-1 rounded-full self-start ${getStatusColor(project.status)}`}>
                    <StyledText className="text-sm font-medium">
                      {project.status}
                    </StyledText>
                  </StyledView>
                </StyledView>
              </StyledView>
              
              <StyledText className="text-gray-600 mb-4 leading-6">
                {project.description}
              </StyledText>
              
              <StyledView className="gap-3">
                <StyledView className="flex-row items-center gap-2">
                  <MapPin size={16} color="#6B7280" />
                  <StyledText className="text-gray-700">{project.location}</StyledText>
                </StyledView>
                
                <StyledView className="flex-row items-center gap-2">
                  <Calendar size={16} color="#6B7280" />
                  <StyledText className="text-gray-700">
                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                  </StyledText>
                </StyledView>
                
                <StyledView className="flex-row items-center gap-2">
                  <Users size={16} color="#6B7280" />
                  <StyledText className="text-gray-700">{project.team} team members</StyledText>
                </StyledView>
              </StyledView>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="mb-6">
            <CardContent>
              <StyledText className="text-lg font-bold mb-4">Progress</StyledText>
              
              <StyledView className="mb-4">
                <StyledView className="flex-row justify-between mb-2">
                  <StyledText className="text-gray-600">Overall Progress</StyledText>
                  <StyledText className="font-medium">{project.progress}%</StyledText>
                </StyledView>
                
                <StyledView className="h-2 bg-gray-200 rounded-full">
                  <StyledView 
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </StyledView>
              </StyledView>
              
              <StyledText className="text-sm text-gray-600">
                {project.tasks.filter(task => task.completed).length} of {project.tasks.length} tasks completed
              </StyledText>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="mb-6">
            <CardContent>
              <StyledText className="text-lg font-bold mb-4">Tasks</StyledText>
              
              <StyledView className="gap-3">
                {project.tasks.map((task) => (
                  <StyledView key={task.id} className="flex-row items-center gap-3">
                    <CheckCircle 
                      size={20} 
                      color={task.completed ? '#10B981' : '#D1D5DB'} 
                    />
                    <StyledText className={`flex-1 ${task.completed ? 'text-gray-500 line-through' : 'text-black'}`}>
                      {task.name}
                    </StyledText>
                  </StyledView>
                ))}
              </StyledView>
            </CardContent>
          </Card>

          {/* Actions */}
          <StyledView className="gap-3 mb-8">
            <Button>
              Update Progress
            </Button>
            
            <Button variant="outline">
              Add Task
            </Button>
            
            <Button variant="outline">
              Share Project
            </Button>
          </StyledView>

        </StyledView>
      </StyledScrollView>
    </StyledView>
  );
}