import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { ROLES, RolesEnum } from '../../../models/roles';
import { LandTreeSummaryResponseDto, RegisterUserRequestDto, UserResponseDto } from '../../../api';
import { UserService } from '../../../services/user.service';
import { AuthService } from '../../../services/auth.service';
import { CompanyService } from '../../../services/company.service';
import { MatDialog } from '@angular/material/dialog';
import { AssignTreesModalComponent } from '../../../modals/assign-trees-modal/assign-trees-modal.component';
import { TreeService } from '../../../services/tree.service';
import { ManageTreesModalComponent } from '../../../modals/manage-trees-modal/manage-trees-modal.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PasswordMode, ResetPasswordComponent } from '../../../pages/reset-password/reset-password.component';

@Component( {
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, MatIconModule, MatSlideToggleModule]
} )
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  hidePassword = true;
  roles = ROLES;
  companies: any[] = [];
  registerSuccess = false;
  registerError = '';
  isEditMode = false;
  userId!: number;
  currentUser?: UserResponseDto;
  selectedFile?: File;
  previewImage?: string;
  user?: UserResponseDto;
  isSelfEdit = false;

  RolesEnum = RolesEnum;
  isCompanyAdmin = false;
  isAdmin = false;
  showCompanySelector = false;
  plantedTrees: LandTreeSummaryResponseDto[] = [];

  constructor (
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private treeService: TreeService,
  ) { }

  ngOnInit (): void {
    this.currentUser = this.authService.getUser() ?? undefined;
    this.isCompanyAdmin = this.currentUser?.role === RolesEnum.COMPANY_ADMIN;
    this.isAdmin = this.currentUser?.role === RolesEnum.ADMIN;

    this.showCompanySelector = false;

    // Inicializamos el formulario
    this.userForm = this.fb.group( {
      name: ['', Validators.required],
      surname: ['', Validators.required],
      secondSurname: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength( 6 )]],
      role: [null as RolesEnum | null, Validators.required],
      receiveEmails: [false],
      companyId: [''],
    } );

    // Cargar roles permitidos
    this.configureAvailableRoles();

    // Si el usuario es ADMIN o COMPANY_ADMIN → edición completa
    if ( this.isAdmin || this.isCompanyAdmin ) {
      this.route.paramMap.subscribe( ( params ) => {
        const id = params.get( 'id' );
        if ( id ) {
          this.isEditMode = true;
          this.userId = +id;
          this.loadUser( this.userId );
          this.loadUserTrees( this.userId );
        }
      } );

      if ( this.isCompanyAdmin ) {
        this.showCompanySelector = true;
        this.companyService.getAllCompanies().subscribe( {
          next: ( data ) => {
            this.companies = data.filter(
              ( c ) => c.users?.some( ( u ) => u.role === RolesEnum.COMPANY_ADMIN )
            );
            const companyId = this.currentUser?.company?.id;
            if ( companyId ) {
              this.userForm.patchValue( { companyId } );
            }
          },
          error: ( err ) => console.error( 'Error cargando compañías', err ),
        } );
      } else {
        this.loadCompanies();
      }
    }
    // 🧍‍♂️ Usuario normal: solo edita su propio perfil
    else {
      this.isEditMode = true;
      this.userId = this.currentUser?.id ?? 0;
      const user = this.userService.getCurrentUser();
      if ( user ) {
        this.userForm.patchValue( {
          name: user.name,
          surname: user.surname,
          secondSurname: user.secondSurname,
          email: user.email,
          role: user.role,
          receiveEmails: user.receiveEmails,
          companyId: user.company?.id ?? '',
          password: '' // dejar vacío
        } );

        // ⚡ Marcar como self-edit
        this.isSelfEdit = true;

        // ⚡ Limitar campos para self-edit
        this.userForm.get( 'role' )?.disable();
        this.userForm.get( 'companyId' )?.disable();
        this.userForm.get( 'password' )?.disable();
        this.loadUserTrees( this.userId );
      }
    }

    // Validación dinámica (solo si aplica)
    this.userForm.get( 'role' )?.valueChanges.subscribe( ( role: RolesEnum ) => {
      const companyControl = this.userForm.get( 'companyId' );
      if ( role === RolesEnum.COMPANY_ADMIN || role === RolesEnum.COMPANY_USER ) {
        this.showCompanySelector = true;
        companyControl?.setValidators( [Validators.required] );
        companyControl?.enable();
      } else {
        this.showCompanySelector = false;
        companyControl?.clearValidators();
        companyControl?.setValue( '' );
        if ( !this.isCompanyAdmin ) companyControl?.disable();
      }
      companyControl?.updateValueAndValidity();
    } );
  }



  private configureAvailableRoles () {
    if ( !this.currentUser ) return;

    if ( this.currentUser.role === RolesEnum.ADMIN ) {
      // Super Admin puede ver todos los roles
      this.roles = ROLES;
    } else if ( this.currentUser.role === RolesEnum.COMPANY_ADMIN ) {
      // Company Admin solo puede crear COMPANY_ADMIN o COMPANY_USER
      this.roles = ROLES.filter(
        r => r.value === RolesEnum.COMPANY_ADMIN || r.value === RolesEnum.COMPANY_USER
      );
    }
  }

  private loadCompanies () {
    this.companyService.getAllCompanies().subscribe( {
      next: data => {
        this.companies = data;
      },
      error: err => console.error( 'Error cargando compañías', err )
    } );
  }

  private loadUser ( id: number ) {
    this.userService.getUserById( id ).subscribe( {
      next: ( user: UserResponseDto ) => {
        this.user = user;
        this.previewImage = user.picture;
        this.isSelfEdit = this.currentUser?.id === this.userId;

        this.userForm.patchValue( {
          name: user.name,
          surname: user.surname,
          secondSurname: user.secondSurname,
          email: user.email,
          role: user.role,
          receiveEmails: user.receiveEmails,
          companyId: user.company?.id ?? '',
        } );

        if ( this.isSelfEdit ) {
          // Si es self edit, limitar campos
          this.userForm.get( 'role' )?.disable();
          this.userForm.get( 'companyId' )?.disable();
          this.userForm.get( 'password' )?.disable();
        } else {
          // Admin no puede cambiar email
          this.userForm.get( 'email' )?.disable();
        }
      },
      error: err => console.error( '❌ Error al cargar usuario', err )
    } );
  }

  onFileSelected ( event: any ): void {
    const file: File = event.target.files[0];
    if ( file ) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => ( this.previewImage = reader.result as string );
      reader.readAsDataURL( file );
    }
  }

  onSubmit (): void {
    if ( this.userForm.invalid ) return;

    const dto: RegisterUserRequestDto = this.userForm.getRawValue();

    console.log( 'dto', dto );

    // Si es COMPANY_ADMIN, forzamos su companyId
    if ( this.isCompanyAdmin ) {
      dto.companyId = this.currentUser?.company?.id ?? undefined;
    }

    let update$;

    if ( this.selectedFile && this.isEditMode ) {
      update$ = this.userService.updateUserPicture( this.userId, this.selectedFile );
    } else if ( this.isEditMode ) {
      update$ = this.isSelfEdit
        ? this.userService.updateUser( this.userId, dto )
        : this.userService.updateUserByAdmin( this.userId, dto );
    } else {
      update$ = this.userService.registerUserByAdmin( dto );
    }

    update$.subscribe( {
      next: ( updatedUser: UserResponseDto ) => {

        console.log( 'updatedUser', updatedUser );
        this.finalizeUpdate( updatedUser );
      },
      error: err => {
        this.registerError = err.error?.message || 'Error al guardar usuario';
        this.registerSuccess = false;
        console.error( err );
      }
    } );
  }

  loadUserTrees ( userId: number ) {
    this.treeService.getTreesByOwner( userId ).subscribe( {
      next: trees => this.plantedTrees = trees,
      error: err => console.error( 'Error al cargar árboles', err )
    } );
  }

  checkRole () {
    const role = this.authService.currentUserRole;
    this.isAdmin = role === 'ADMIN';
  }

  openAssignTreesModal ( userId: number ) {
    const dialogRef = this.dialog.open( AssignTreesModalComponent, {
      width: '400px',
      data: { userId }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result && result.treeTypeId && result.plannedPlantationId ) {
        const payload = {
          ownerUserId: result.ownerUserId,
          ownerCompanyId: result.ownerCompanyId,
          landId: result.landId,
          plannedPlantationId: result.plannedPlantationId,
          treeTypeId: result.treeTypeId,
          quantity: result.quantity
        };
        // Llamamos al endpoint batch desde el padre
        this.treeService.plantTreeBatch( payload ).subscribe( {
          next: () => {

            // 🔹 Recargamos el usuario desde backend
            this.userService.getUserById( userId ).subscribe( {
              next: ( updatedUser ) => {
                this.user = updatedUser;
                this.userForm.patchValue( { pendingTreesCount: updatedUser.pendingTreesCount } );

                // 🔹 También recargamos los árboles plantados
                this.loadUserTrees( userId );
              },
              error: err => console.error( 'Error recargando usuario', err )
            } );
          },
          error: ( err ) => {
            console.error( 'Error plantando árboles', err );
          }
        } );
      }
    } );
  }

  openChangePassword () {
    this.router.navigate( ['/profile/change-password'] );
  }


  private finalizeUpdate ( user: UserResponseDto ) {
    this.user = user;
    this.previewImage = user.picture;
    this.selectedFile = undefined;
    this.snackBar.open( '✅ Usuario actualizado con éxito', 'Cerrar', { duration: 3000 } );

    if ( this.isSelfEdit ) {
      this.authService.updateCurrentUser( user );
      this.router.navigate( ['/profile'] );
    } else {
      this.router.navigate( ['/admin/users'] );
    }
  }

  onCancel () {
    if ( this.isSelfEdit ) {
      this.router.navigate( ['/profile'] );
    } else {
      this.router.navigate( ['/admin/users'] );
    }
  }

  showCompanySelectorDynamic (): boolean {
    const selectedRole = this.userForm.get( 'role' )?.value;

    return selectedRole === RolesEnum.COMPANY_ADMIN || selectedRole === RolesEnum.COMPANY_USER;
  }

  // Devuelve true si el usuario que edita es COMPANY_ADMIN (solo su propia compañía)
  isCompanyAdminEditing (): boolean {
    return this.authService.currentUserRole === RolesEnum.COMPANY_ADMIN;
  }

  // Devuelve la lista de compañías disponibles según el rol del editor
  getSelectableCompanies () {
    if ( this.authService.currentUserRole === RolesEnum.ADMIN ) {
      return this.companies; // todas las compañías
    } else {
      // COMPANY_ADMIN solo su propia compañía
      return this.companies.filter( c => c.id === this.authService.currentUserCompanyId );
    }
  }

  openUnassignTreesModal ( treeGroup: any ) {
    const dialogRef = this.dialog.open( ManageTreesModalComponent, {
      width: '400px',
      data: { userId: this.userId, companyId: undefined, treeTypeId: treeGroup.treeTypeId }
    } );

    dialogRef.afterClosed().subscribe( result => {
      if ( result?.updated ) {
        this.loadUserTrees( this.userId! );
      }
    } );
  }
}
