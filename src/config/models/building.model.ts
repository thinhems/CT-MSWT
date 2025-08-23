import { Area } from "./area.model";

export interface Building {
  buildingId: string;
  buildingName: string;
  description: string;
  areas?: Area[];
}

export interface ICreateBuildingRequest {
  buildingName: string;
  description: string;
}

export interface IUpdateBuildingRequest {
  buildingName: string;
  description: string;
}
