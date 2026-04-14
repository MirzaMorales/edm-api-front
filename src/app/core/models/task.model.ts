export interface Task {
  id?: number;
  name: string;
  description: string;
  priority: boolean;
  completed?: boolean;
  user_Id?: number;
}
