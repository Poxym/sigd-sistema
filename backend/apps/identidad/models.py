"""Identidad y acceso. Tablas: users, roles, role_assignments (el resto, pendiente; ver __init__)."""
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models

from apps.core.models import ConVigencia, ModeloBase


class GestorUsuarios(BaseUserManager):
    def create_user(self, correo, password=None, **extra):
        usuario = self.model(correo=self.normalize_email(correo), **extra)
        usuario.set_password(password)
        usuario.save(using=self._db)
        return usuario

    def create_superuser(self, correo, password=None, **extra):
        extra.update(is_staff=True, is_superuser=True)
        return self.create_user(correo, password, **extra)


class Usuario(ModeloBase, AbstractBaseUser):
    """Usuario institucional. El número de empleado es modificable y NO es la identidad.

    Nota: el esquema actual separa la contraseña en la tabla ``credentials``; aquí vive en
    ``password`` (AbstractBaseUser). Ver decisión D4 en docs/DECISIONES.md.
    """

    auth_uid = models.CharField(max_length=128, unique=True, null=True, blank=True)
    numero_empleado = models.CharField(max_length=20, unique=True)
    nombres = models.CharField(max_length=120)
    primer_apellido = models.CharField(max_length=120, blank=True)
    segundo_apellido = models.CharField(max_length=120, blank=True)
    correo = models.EmailField(unique=True)
    is_active = models.BooleanField("activo", default=True)
    is_staff = models.BooleanField(default=False)  # acceso a /admin de Django (solo soporte técnico)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = "correo"
    REQUIRED_FIELDS = ["numero_empleado", "nombres", "primer_apellido"]
    objects = GestorUsuarios()

    class Meta:
        db_table = "users"

    def nombre_completo(self) -> str:
        return " ".join(p for p in (self.nombres, self.primer_apellido, self.segundo_apellido) if p)

    # Mínimo que pide django.contrib.admin
    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser


class Rol(ModeloBase):
    codigo = models.CharField(max_length=40, unique=True)
    nombre = models.CharField(max_length=120)
    activo = models.BooleanField(default=True)

    class Meta:
        db_table = "roles"

    def __str__(self):
        return self.nombre


class AsignacionRol(ModeloBase, ConVigencia):
    usuario = models.ForeignKey(Usuario, on_delete=models.PROTECT, related_name="asignaciones")
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, related_name="asignaciones")
    campus_id = models.CharField(max_length=36, null=True, blank=True)  # FK a estructura.Campus (pendiente)
    carrera_id = models.CharField(max_length=36, null=True, blank=True)  # FK a estructura.Carrera (pendiente)

    class Meta:
        db_table = "role_assignments"
