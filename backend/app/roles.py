from enum import Enum

class Role(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN_ORG = "admin_org"
    BCM = "bcm"
    IT = "it"
    GESTIONNAIRE_CRISE = "gestionnaire_crise"
    CONTRIBUTEUR = "contributeur"
    AUDITEUR = "auditeur"

PERMISSIONS = {
    Role.SUPER_ADMIN: [
        "gestion_utilisateurs", "parametres_org", "bia", "pca_pra",
        "gestion_crise", "exports",
        "continuite_admin",   # créer/modifier connecteurs, importer fichiers
        "continuite_lecture", # lire les fiches
        "continuite_ecriture" # modifier enregistrements + commenter
    ],
    Role.ADMIN_ORG: [
        "gestion_utilisateurs", "parametres_org", "bia", "pca_pra",
        "gestion_crise", "exports",
        "continuite_admin",
        "continuite_lecture",
        "continuite_ecriture"
    ],
    Role.BCM: [
        "bia", "pca_pra", "exports",
        "continuite_admin",
        "continuite_lecture",
        "continuite_ecriture"
    ],
    Role.IT: [
        "bia_lecture", "pca_pra", "gestion_crise_lecture", "exports",
        "continuite_lecture",
        "continuite_ecriture"
    ],
    Role.GESTIONNAIRE_CRISE: [
        "gestion_crise", "pca_pra_lecture", "exports",
        "continuite_lecture",
        "continuite_ecriture"
    ],
    Role.CONTRIBUTEUR: [
        "continuite_lecture",
        "continuite_ecriture"
    ],
    Role.AUDITEUR: [
        "bia_lecture", "pca_pra_lecture", "gestion_crise_lecture", "exports",
        "continuite_lecture"  # lecture seule, pas d'écriture
    ],
}

def a_permission(role: Role, permission: str) -> bool:
    return permission in PERMISSIONS.get(role, [])

ROLES_ADMIN = [Role.SUPER_ADMIN, Role.ADMIN_ORG, Role.BCM]
