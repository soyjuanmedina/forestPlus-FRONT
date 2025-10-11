import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { UserService } from '../../../../services/user.service';
import { UserResponseDto } from '../../../../api/model/userResponse';
import { RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component( {
  selector: 'app-admin-users',
  standalone: true,
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSortModule
  ]
} )
export class AdminUsersComponent implements OnInit {
  users = new MatTableDataSource<UserResponseDto>();
  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];

  @ViewChild( MatPaginator ) paginator!: MatPaginator;
  @ViewChild( MatSort ) sort!: MatSort;

  constructor ( private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog ) { }

  ngOnInit (): void {
    this.loadUsers();
  }

  ngAfterViewInit (): void {
    this.users.paginator = this.paginator;
    this.users.sort = this.sort;
  }

  loadUsers (): void {
    this.userService.getAllUsers().subscribe( {
      next: ( data ) => {
        console.log( '📥 Usuarios desde el back:', data );
        this.users.data = data;
      },
      error: ( err ) => {
        console.error( '❌ Error al cargar usuarios', err );
      }
    } );
  }

  onEdit ( user: UserResponseDto ): void {
    console.log( '✏️ Editar usuario:', user );
    // Aquí abrirás un modal de edición más adelante
  }

  onDelete ( user: any ): void {
    const dialogRef = this.dialog.open( ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Eliminar usuario',
        message: `¿Estás seguro de que quieres eliminar a ${user.name}?`
      }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result ) {
        this.userService.deleteUser( user.id ).subscribe( {
          next: () => {
            this.snackBar.open( '✅ Usuario eliminado', 'Cerrar', { duration: 3000 } );
            this.loadUsers();
          },
          error: ( err ) => {
            console.error( 'Error al eliminar usuario', err );
            this.snackBar.open( '❌ Error al eliminar usuario', 'Cerrar', { duration: 3000 } );
          }
        } );
      }
    } );
  }

  applyFilter ( event: Event ): void {
    const filterValue = ( event.target as HTMLInputElement ).value;
    this.users.filter = filterValue.trim().toLowerCase();
  }
}
