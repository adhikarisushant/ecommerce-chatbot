import { ConversationTree, ConversationState, ConversationNode } from "./types";

export class ConversationManager {
  private conversationTree: ConversationTree;
  private conversations: Map<string, ConversationState>;

  constructor(tree: ConversationTree) {
    this.conversationTree = tree;
    this.conversations = new Map();
  }

  private getMainMenuNode(): ConversationNode {
    return {
      id: 'unknown_input',
      message: "I apologize, but I don't understand that response. Let me show you the available options:",
      type: 'multiple_choice',
      options: this.conversationTree.nodes[this.conversationTree.startNodeId].options || []
    };
  }

  public initializeConversation(customerId: string): ConversationState {
    const state: ConversationState = {
      customerId,
      currentNodeId: this.conversationTree.startNodeId,
      history: []
    };
    this.conversations.set(customerId, state);
    return state;
  }

  public getCurrentNode(customerId: string): ConversationNode | null {
    const state = this.conversations.get(customerId);
    if (!state) return null;
    return this.conversationTree.nodes[state.currentNodeId];
  }

  public processResponse(customerId: string, response: string): ConversationNode | null {
    const state = this.conversations.get(customerId);
    if (!state) return null;

    const currentNode = this.conversationTree.nodes[state.currentNodeId];
    let nextNodeId: string | undefined;
    let invalidInput = false;

    if (currentNode.type === 'multiple_choice') {
      const selectedOption = currentNode.options?.find(opt => 
        opt.text.toLowerCase() === response.toLowerCase()
      );
      nextNodeId = selectedOption?.nextNodeId;

       // If response doesn't match any option, mark as invalid
       if (!selectedOption) {
        invalidInput = true;
      }
    } else {
      nextNodeId = currentNode.nextNodeId;
    }

    // Record the response in history
    state.history.push({
      nodeId: state.currentNodeId,
      response,
      timestamp: Date.now()
    });

     // Handle invalid input or no next node
     if (invalidInput) {
      return this.getMainMenuNode();
    }

    // If there's no next node, mark current node as an end node
    if (!nextNodeId) {
      return {
        id: 'conversation_end',
        message: "Thank you for chatting with us! Would you like to start over?",
        type: 'multiple_choice',
        isEndNode: true,
        options: [
          { text: 'Start Over', nextNodeId: this.conversationTree.startNodeId }
        ]
      };
    }

    // Update the current node and return the next node
    state.currentNodeId = nextNodeId;
    return this.conversationTree.nodes[nextNodeId];
  }

  public restartConversation(customerId: string): ConversationNode {
    const state = this.conversations.get(customerId);
    if (state) {
      state.currentNodeId = this.conversationTree.startNodeId;
      state.history = [];
    } else {
      this.initializeConversation(customerId);
    }
    return this.conversationTree.nodes[this.conversationTree.startNodeId];
  }

  public updateConversationTree(newTree: ConversationTree): void {
    this.conversationTree = newTree;
    // Reset all active conversations
    this.conversations.clear();
  }
}
  