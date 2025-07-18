import { Restroom } from "./restroom.model";

export interface ICreateFloorRequest {
  status: string;
  floorNumber: number;
}

export interface IUpdateFloorRequest {
  numberOfRestroom: number;
  numberOfBin: number;
  status: string;
  floorNumber: number;
}

export interface Floor {
  floorId: string;
  floorNumber: number;
  description?: string;
  numberOfRestroom: number;
  numberOfBin: number;
  status: string;
  restrooms?: Restroom[];
}
