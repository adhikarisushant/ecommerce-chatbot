  export interface ConversationNode {
      id: string;
      message: string;
      options?: {
        text: string;
        nextNodeId?: string;
      }[];
      type: 'text' | 'multiple_choice';
      nextNodeId?: string;
      isEndNode?: boolean;
    }
    
    export interface ConversationTree {
      nodes: { [key: string]: ConversationNode };
      startNodeId: string;
    }
  
  export interface ConversationState {
    customerId: string;
    currentNodeId: string;
    history: {
      nodeId: string;
      response?: string;
      timestamp: number;
    }[];
  }