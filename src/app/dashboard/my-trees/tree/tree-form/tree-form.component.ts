import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TreeResponseDto, TreeUpdateRequestDto } from '../../../../api';
import { TreeService } from '../../../../services/tree.service';
import { AuthService } from '../../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component( {
  selector: 'app-tree-form',
  standalone: true,
  imports: [CommonModule, CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    TranslateModule],
  templateUrl: './tree-form.component.html',
  styleUrls: ['./tree-form.component.scss']
} )
export class TreeFormComponent implements OnInit {
  treeForm!: FormGroup;
  tree!: TreeResponseDto;
  isAdmin = false;

  constructor (
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private treeService: TreeService,
    private authService: AuthService
  ) { }

  ngOnInit (): void {
    this.isAdmin = this.authService.currentUserRole === 'ADMIN';

    const id = this.route.snapshot.paramMap.get( 'id' );
    if ( id ) {
      this.treeService.getTreeById( +id ).subscribe( tree => {
        this.tree = tree;
        this.initForm();
      } );
    }
  }

  private initForm (): void {
    this.treeForm = this.fb.group( {
      customName: [this.tree.customName || ''], // ← nombre personalizado
      treeTypeName: [{ value: this.tree.treeType?.name, disabled: true }],
      scientificName: [{ value: this.tree.scientificName, disabled: true }],
      co2AbsorptionAt20: [
        { value: this.tree.co2AbsorptionAt20, disabled: !this.isAdmin },
        [Validators.required, Validators.min( 0 )]
      ],
      plantedAt: [
        { value: this.tree.plantedAt, disabled: !this.isAdmin },
        Validators.required
      ],
      landName: [{ value: this.tree.land?.name, disabled: true }],
      ownerName: [{ value: this.tree.ownerUserName, disabled: true }]
    } );
  }

  save (): void {
    if ( !this.treeForm.valid ) return;

    const updateDto: TreeUpdateRequestDto = {
      co2AbsorptionAt20: this.treeForm.get( 'co2AbsorptionAt20' )?.value,
      plantedAt: this.treeForm.get( 'plantedAt' )?.value,
      customName: this.treeForm.get( 'customName' )?.value // ← incluir customName
    };

    this.treeService.updateTree( this.tree.id!, updateDto ).subscribe( () => {
      this.router.navigate( ['/tree', this.tree.id] );
    } );
  }

  cancel (): void {
    this.router.navigate( ['/tree', this.tree.id] );
  }
}
