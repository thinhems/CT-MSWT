import { Room } from "./room.model";

export interface Area {
  areaId: string;
  buildingId: string;
  buildingName: string;
  description: string;
  status: string;
  areaName: string;
  rooms: Room[];
}

export interface ICreateAreaRequest {
  buildingId: string;
  description: string;
  status: string;
  areaName: string;
}

export interface IUpdateAreaRequest {
  buildingId: string;
  description: string;
  status: string;
  areaName: string;
}
