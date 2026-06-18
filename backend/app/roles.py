from enum import Enum

class Role(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN_ORG = "admin_org"
    BCM = "bcm"
    IT = "it"
    GESTIONNAIRE_CRISE = "gestionnaire_crise"
    CONTRIBUTEUR = "contributeur"
    AUDITEUR = "auditeur"

# Référentiel RBAC officiel
# ✅ = accès complet  👁️ = lecture seule  ❌ = aucun accès
PERMISSIONS = {
    Role.SUPER_ADMIN: [
        "gestion_utilisateurs", "parametres_org",
        "bia", "pca_pra", "gestion_crise", "exports",
        "continuite_admin", "continuite_lecture", "continuite_ecriture",
    ],
    Role.ADMIN_ORG: [
        "gestion_utilisateurs", "parametres_org",
        "bia", "pca_pra", "gestion_crise", "exports",
        "continuite_admin", "continuite_lecture", "continuite_ecriture",
    ],
    Role.BCM: [
        "bia", "pca_pra", "exports",
        "continuite_admin", "continuite_lecture", "continuite_ecriture",
    ],
    Role.IT: [
        "bia_lecture", "pca_pra", "gestion_crise_lecture", "exports",
        "continuite_lecture", "continuite_ecriture",
    ],
    Role.GESTIONNAIRE_CRISE: [
        "pca_pra_lecture", "gestion_crise", "exports",
        "continuite_lecture", "continuite_ecriture",
    ],
    Role.CONTRIBUTEUR: [
        # Aucun droit BIA/PCA/PRA/crise/exports - utilisateur standard
        "continuite_lecture", "continuite_ecriture",
    ],
    Role.AUDITEUR: [
        "bia_lecture", "pca_pra_lecture", "gestion_crise_lecture", "exports",
        "continuite_lecture",  # lecture seule, pas d'écriture
    ],
}

def a_permission(role, permission: str) -> bool:
    role_val = role.value if hasattr(role, "value") else role
    for r, perms in PERMISSIONS.items():
        if r.value == role_val:
            return permission in perms
    return False

# Rôles ayant un accès admin à la plateforme (gestion utilisateurs, services, connecteurs)
ROLES_ADMIN_PLATEFORME = [Role.SUPER_ADMIN, Role.ADMIN_ORG]

# Rôles pouvant administrer les connecteurs Continuité (créer/modifier/importer)
ROLES_ADMIN_CONTINUITE = [Role.SUPER_ADMIN, Role.ADMIN_ORG, Role.BCM]

# Rôles ayant accès en lecture/écriture aux données Continuité de leur service
ROLES_ECRITURE_CONTINUITE = [
    Role.SUPER_ADMIN, Role.ADMIN_ORG, Role.BCM,
    Role.IT, Role.GESTIONNAIRE_CRISE, Role.CONTRIBUTEUR
]
