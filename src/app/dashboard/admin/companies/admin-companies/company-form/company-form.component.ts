import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyResponseDto, UserResponseDto } from '../../../../../api';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../../../../services/company.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../../../services/user.service';
import { RolesEnum } from '../../../../../models/roles';

@Component( {
  selector: 'app-company-form',
  templateUrl: './company-form.component.html',
  styleUrls: ['./company-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule]
} )
export class CompanyFormComponent implements OnInit {

  companyForm!: FormGroup;
  isEditMode = false;
  companyId!: number;
  registerSuccess = false;
  registerError = '';
  previewImage?: string;
  selectedFile?: File;
  company?: CompanyResponseDto;
  admins: UserResponseDto[] = [];

  constructor (
    private fb: FormBuilder,
    private companyService: CompanyService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private userService: UserService
  ) { }

  ngOnInit (): void {
    this.route.paramMap.subscribe( params => {
      const id = params.get( 'id' );
      if ( id ) {
        this.isEditMode = true;
        this.companyId = +id;
        this.loadCompanyAndAdmins( this.companyId );
      } else {
        // Si no es edición, cargamos solo admins existentes
        this.loadAdmins();
      }
    } );

    this.companyForm = this.fb.group( {
      name: ['', Validators.required],
      address: [''],
      adminId: [null, Validators.required] // siempre obligatorio
    } );
  }

  private loadCompanyAndAdmins ( id: number ) {
    this.companyService.getCompanyById( id ).subscribe( {
      next: company => {
        this.company = company;
        this.previewImage = company.picture;

        // Ahora cargamos los admins con la compañía ya disponible
        this.loadAdmins( () => {
          this.companyForm.patchValue( {
            name: company.name,
            address: company.address,
            adminId: company.admin?.id ?? null
          } );
        } );
      },
      error: err => console.error( 'Error cargando compañía', err )
    } );
  }

  private loadAdmins ( afterLoad?: () => void ) {
    this.userService.getUsers().subscribe( {
      next: pageUsers => {
        this.admins = ( pageUsers.content ?? [] ).filter( u =>
          u.role === RolesEnum.COMPANY_ADMIN &&
          ( !u.company || u.company.id === this.company?.id )
        );

        if ( afterLoad ) afterLoad(); // 👈 ejecutamos el callback cuando ya están cargados
      },
      error: err => console.error( 'Error cargando admins', err )
    } );
  }

  onFileSelected ( event: any ): void {
    const file: File = event.target.files[0];
    if ( file ) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewImage = reader.result as string;
      reader.readAsDataURL( file );
    }
  }

  onSubmit (): void {
    if ( this.companyForm.invalid ) return;

    const dto = this.companyForm.value;

    // Si hay imagen seleccionada y estamos editando
    const update$ = this.selectedFile && this.isEditMode
      ? this.companyService.updateCompanyPicture( this.companyId, this.selectedFile )
      : this.isEditMode
        ? this.companyService.updateCompany( this.companyId, dto )
        : this.companyService.createCompany( dto );

    update$.subscribe( {
      next: ( company: CompanyResponseDto ) => {
        this.registerSuccess = true;
        this.registerError = '';
        this.previewImage = company.picture;
        this.selectedFile = undefined;
        this.companyForm.reset();
        this.snackBar.open( this.isEditMode ? '✅ Compañía actualizada' : '✅ Compañía creada', 'Cerrar', { duration: 3000 } );
        this.router.navigate( ['/admin/companies'] );
      },
      error: err => {
        this.registerError = err.error?.message || 'Error al guardar compañía';
        this.registerSuccess = false;
        console.error( err );
      }
    } );
  }

}
