import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TreeTypeResponseDto } from '../../api/model/treeTypeResponse';
import { TreeTypeService } from '../../services/tree-type.service';
import { UserService } from '../../services/user.service';
import { RolesEnum } from '../../models/roles';
import { UserResponseDto } from '../../api/model/userResponse';
import { TranslateModule } from '@ngx-translate/core';

@Component( {
  selector: 'app-tree-types-view',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, TranslateModule],
  templateUrl: './tree-type.component.html',
  styleUrls: ['./tree-type.component.scss']
} )
export class TreeTypeComponent implements OnInit {

  treeType!: TreeTypeResponseDto;
  previewImage: string | null = null;
  user: UserResponseDto | null = null;
  isEditable = false;

  constructor (
    private route: ActivatedRoute,
    private router: Router,
    private treeTypeService: TreeTypeService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) { }

  ngOnInit (): void {
    const id = this.route.snapshot.paramMap.get( 'id' );
    this.user = this.userService.getCurrentUser();

    if ( id ) {
      this.treeTypeService.getTreeTypeById( +id ).subscribe( {
        next: ( treeType ) => {
          this.treeType = treeType;
          this.previewImage = treeType.picture || 'assets/tree_placeholder.png';
          this.isEditable = this.user?.role === RolesEnum.ADMIN;
        },
        error: ( err ) => {
          console.error( '❌ Error al cargar tipo de árbol', err );
          this.snackBar.open( 'Error al cargar el tipo de árbol', 'Cerrar', { duration: 3000 } );
        }
      } );
    }
  }

  goToEditForm (): void {
    console.log( 'this.treeType?.id', this.treeType?.id );
    if ( this.treeType?.id ) {
      this.router.navigate( ['/admin/tree-type-form', this.treeType.id] );
    }
  }
}
