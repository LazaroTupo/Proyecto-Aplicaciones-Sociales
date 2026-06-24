import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  Length 
} from 'class-validator';

export class RegisterUserDto {

  @IsNotEmpty({ message: 'El correo electrónico es obligatorio.' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido (ejemplo@correo.com).' })
  email!: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
  @Length(6, 40, { message: 'La contraseña debe tener entre 6 y 40 caracteres.' })
  password!: string;

  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres.' })
  name?: string;
}