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
    Role.SUPER_ADMIN: ["gestion_utilisateurs", "parametres_org", "bia", "pca_pra", "gestion_crise", "exports"],
    Role.ADMIN_ORG: ["gestion_utilisateurs", "parametres_org", "bia", "pca_pra", "gestion_crise", "exports"],
    Role.BCM: ["bia", "pca_pra", "exports"],
    Role.IT: ["bia_lecture", "pca_pra", "gestion_crise_lecture", "exports"],
    Role.GESTIONNAIRE_CRISE: ["gestion_crise", "pca_pra_lecture", "exports"],
    Role.CONTRIBUTEUR: [],
    Role.AUDITEUR: ["bia_lecture", "pca_pra_lecture", "gestion_crise_lecture", "exports"],
}

def a_permission(role: Role, permission: str) -> bool:
    return permission in PERMISSIONS.get(role, [])
