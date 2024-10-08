export interface ConversationNode {
    id: string;
    message: string;
    options?: {
      text: string;
      nextNodeId: string;
    }[];
    type: 'text' | 'multiple_choice';
    nextNodeId?: string;
    isEndNode?: boolean;
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

export interface ChatResponse {
    node: ConversationNode;
}
  
export interface StartChatResponse {
    state: ConversationState;
    currentNode: ConversationNode;
}