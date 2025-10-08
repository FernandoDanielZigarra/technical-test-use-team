import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { socketService } from '~/services/socket.service';
import {
  setSocketConnected,
  updateProject,
  addColumn,
  updateColumn,
  removeColumn,
  addTask,
  updateTask,
  moveTaskBetweenColumns,
  removeTask,
  addParticipant,
  removeParticipant,
} from '~/store/slices/projectSlice';
import { projectsApi } from '~/api/projectsApi';

export function useSocket(projectId: string | null) {
  const dispatch = useDispatch();
  const disconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [removedFromProject, setRemovedFromProject] = useState<{ projectId: string; projectName: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (disconnectTimeoutRef.current) {
      clearTimeout(disconnectTimeoutRef.current);
      disconnectTimeoutRef.current = null;
    }

    socketService.connect(token);
    dispatch(setSocketConnected(true));

    socketService.onProjectUpdated((project) => {
      dispatch(updateProject(project));
    });

    socketService.onColumnCreated((column) => {
      dispatch(addColumn(column));
    });

    socketService.onColumnUpdated((column) => {
      dispatch(updateColumn(column));
    });

    socketService.onColumnDeleted((columnId) => {
      dispatch(removeColumn(columnId));
    });

    socketService.onTaskCreated((task) => {
      dispatch(addTask(task));
    });

    socketService.onTaskUpdated((task) => {
      dispatch(updateTask(task));
    });

    socketService.onTaskMoved((data) => {
      dispatch(moveTaskBetweenColumns(data));
      
      dispatch(projectsApi.util.invalidateTags(['Task', 'Column']));
    });

    socketService.onTaskDeleted((taskId) => {
      dispatch(removeTask(taskId));
    });

    socketService.onParticipantAdded((participant) => {
      dispatch(addParticipant(participant));
    });

    socketService.onParticipantRemoved((participantId) => {
      dispatch(removeParticipant(participantId));
    });

    socketService.onUserRemovedFromProject((data) => {
      setRemovedFromProject(data);
    });

    return () => {
      socketService.off('project:updated');
      socketService.off('column:created');
      socketService.off('column:updated');
      socketService.off('column:deleted');
      socketService.off('task:created');
      socketService.off('task:updated');
      socketService.off('task:moved');
      socketService.off('task:deleted');
      socketService.off('participant:added');
      socketService.off('participant:removed');
      socketService.off('user:removed-from-project');
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
      }
      disconnectTimeoutRef.current = setTimeout(() => {
        socketService.disconnect();
        dispatch(setSocketConnected(false));
        disconnectTimeoutRef.current = null;
      }, 0);
    };
  }, [dispatch]);

  useEffect(() => {
    if (projectId) {
      socketService.joinProject(projectId);
    }

    return () => {
      if (projectId) {
        socketService.leaveProject(projectId);
      }
    };
  }, [projectId]);

  return { removedFromProject, clearRemovedFromProject: () => setRemovedFromProject(null) };
}
