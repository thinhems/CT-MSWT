export interface Room {
  roomId: string;
  description: string;
  areaId: string | null;
  status: string;
  roomNumber: string;
  roomType: string;
  trashBins: string[];
}

export interface RoomCreateRequest {
  description: string;
  areaId: string | null;
  status: string;
  roomNumber: string;
  roomType: string;
}

export interface RoomUpdateRequest {
  description?: string;
  areaId?: string | null;
  status?: string;
  roomNumber?: string;
  roomType?: string;
}
