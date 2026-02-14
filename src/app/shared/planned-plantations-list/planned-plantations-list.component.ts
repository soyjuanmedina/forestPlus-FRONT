import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PlannedPlantationResponseDto } from '../../api/model/plannedPlantationResponse';

@Component( {
  selector: 'app-planned-plantations-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './planned-plantations-list.component.html'
} )
export class PlannedPlantationsListComponent {

  /** Lista de plantaciones */
  @Input() plantations: PlannedPlantationResponseDto[] = [];

  /** Mostrar botones de acción */
  @Input() editable = false;

  /** Acciones (opcionales) */
  @Output() edit = new EventEmitter<PlannedPlantationResponseDto>();

  get activePlantations (): PlannedPlantationResponseDto[] {
    return this.plantations?.filter( p => p.isActive ) || [];
  }
}
