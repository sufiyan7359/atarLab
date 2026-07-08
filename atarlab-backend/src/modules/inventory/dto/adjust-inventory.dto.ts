import { IsInt, IsUUID } from 'class-validator';

export class AdjustInventoryDto {
  @IsUUID()
  variantId: string;

  @IsInt()
  changeQty: number; // positive to add stock, negative to remove
}
