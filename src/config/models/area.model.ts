export interface Area {
  areaId: string;
  floorId: string;
  description: string;
  status: string;
  roomBegin: string;
  roomEnd: string;
  areaName: string;
  floorNumber: number;
}

export interface ICreateAreaRequest {
  description: string;
  status: string;
  roomBegin: string;
  roomEnd: string;
  areaName: string;
  floorId: string;
  floorNumber: number;
}

export interface IUpdateAreaRequest {
  description: string;
  status: string;
  roomBegin: string;
  roomEnd: string;
  areaName: string;
  floorId: string;
  floorNumber: number;
}
