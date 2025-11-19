export interface Coordinates {
  lat: number;
  lng: number;
}

export enum ModelType {
  LOCATION_SEARCH = 'gemini-2.5-flash',
  DEEP_CHAT = 'gemini-3-pro-preview'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeId?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  groundingChunks?: GroundingChunk[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  model: ModelType;
}