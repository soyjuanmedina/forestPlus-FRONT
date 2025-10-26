import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
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
export class AdminUsersComponent implements OnInit, AfterViewInit {
  users = new MatTableDataSource<UserResponseDto>();
  displayedColumns: string[] = ['name', 'email', 'role', 'actions'];
  totalPages: number = 1;
  currentPage = 0;
  pageSize = 15;

  @ViewChild( MatPaginator ) paginator!: MatPaginator;
  @ViewChild( MatSort ) sort!: MatSort;

  constructor (
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit (): void {
    // No se llama aquí a loadUsers porque paginator aún no existe
  }

  ngAfterViewInit (): void {
    this.users.paginator = this.paginator;
    this.users.sort = this.sort;
    this.loadUsers(); // Sí llamamos aquí
  }

  loadUsers (): void {
    const page = this.currentPage;
    const size = this.pageSize;
    const sort = this.sort?.active && this.sort?.direction
      ? `${this.sort.active},${this.sort.direction}`
      : 'id,asc';

    const currentUser = this.userService.getCurrentUser();
    const companyIdFilter = currentUser?.role === RolesEnum.COMPANY_ADMIN
      ? currentUser.company?.id
      : undefined;

    this.userService.getUsers( page, size, sort, undefined, companyIdFilter ).subscribe( {
      next: data => {
        const filteredUsers = ( data.content ?? [] ).filter( u => u.id !== currentUser?.id );
        this.users.data = filteredUsers;

        const totalElements = data.totalElements ?? filteredUsers.length;
        this.totalPages = Math.ceil( totalElements / size );
      },
      error: err => console.error( '❌ Error al cargar usuarios', err )
    } );
  }


  previousPage (): void {
    if ( this.currentPage > 0 ) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  nextPage (): void {
    if ( this.currentPage + 1 < this.totalPages ) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  onEdit ( user: UserResponseDto ): void {
    this.router.navigate( ['/admin/user-form/', user.id] );
  }

  addUser (): void {
    this.router.navigate( ['/admin/user-form'] );
  }

  onView ( user: UserResponseDto ): void {
    this.router.navigate( ['/profile', user.id] );
  }

  onDelete ( user: UserResponseDto ): void {
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
            this.currentPage = 0;
            this.loadUsers();
          },
          error: err => {
            console.error( '❌ Error al eliminar usuario', err );
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
