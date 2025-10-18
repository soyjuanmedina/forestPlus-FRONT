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
import { Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { RolesEnum } from '../../../../models/roles';


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
    private dialog: MatDialog,
    private router: Router ) { }

  ngOnInit (): void {
    this.loadUsers();
  }

  ngAfterViewInit (): void {
    this.users.paginator = this.paginator;
    this.users.sort = this.sort;
  }

  loadUsers (): void {
    const page = this.paginator?.pageIndex ?? 0;
    const size = this.paginator?.pageSize ?? 10;
    const sort = this.sort && this.sort.active && this.sort.direction
      ? `${this.sort.active},${this.sort.direction}`
      : 'id,asc';

    // Obtener el usuario actual
    const currentUser = this.userService.getCurrentUser();

    // Solo filtrar por companyId si es COMPANY_ADMIN
    const companyIdFilter = currentUser?.role === RolesEnum.COMPANY_ADMIN
      ? currentUser.company?.id
      : undefined;

    this.userService.getUsers( page, size, sort, undefined, companyIdFilter ).subscribe( {
      next: ( data ) => {
        const content = data.content ?? [];

        // ❌ Excluir el usuario actual
        const filteredUsers = content.filter( u => u.id !== currentUser?.id );

        this.users.data = filteredUsers;

        if ( this.paginator ) {
          this.paginator.length = data.totalElements
            ? data.totalElements - 1 // Restar el actual si estaba incluido
            : filteredUsers.length;
        }
      },
      error: ( err ) => {
        console.error( '❌ Error al cargar usuarios', err );
      }
    } );
  }


  onEdit ( user: UserResponseDto ): void {
    this.router.navigate( ['/admin/user-form/', user.id] );
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
