class OrgUnitTreeMapper {
  constructor(orgUnits, params) {
    this.orgUnits = orgUnits;
    this.geoconnectAttributeID = params.geoconnectAttributeID;
    this.spellingsAttributeID = params.spellingsAttributeID;
    this.rootOrgId = params.rootOrgId;
  }

  // Org to tree mapping
  // Structure:
  // {
  //   id: "ORG00000000",
  //   name: "Name",
  //   spellings: ["Name", "Name1", "Name2"],
  //   geoconnectId: "AAAAAAA",
  //   path: "/ORG00000000/ORG00000001",
  //   children: [{}]
  // }
  orgsToTree() {
    var rootOrg = this.findOrgById(this.rootOrgId, this.orgUnits);
    return this.nodeFromOrgUnit(rootOrg, this.orgUnits);
  }

  nodeFromOrgUnit(orgUnit, orgUnits) {
    var node = {
      id: orgUnit.id,
      name: orgUnit.name,
      spellings: this.orgNames(orgUnit),
      path: orgUnit.path,
      children: []
    };
    var geoAttr = this.getOrgAttribute(orgUnit, this.geoconnectAttributeID);
    if (geoAttr) node.geoconnectId = geoAttr.value
    var childrenUnits = this.orgChildren(orgUnit, orgUnits);
    for (var i = 0; i < childrenUnits.length; i++) {
      node.children.push(this.nodeFromOrgUnit(childrenUnits[i], orgUnits));
    }
    return node;
  }

  findOrgById(id, orgUnits) {
    for (var i = 0; i < orgUnits.length; i++) {
      if (orgUnits[i].id == id) return orgUnits[i];
    }
  }
  orgChildren(orgUnit, orgUnits) {
    var children = [];
    for (var i = 0; i < orgUnits.length; i++) {
      if (orgUnits[i].parent && orgUnits[i].parent.id == orgUnit.id) {
        children.push(orgUnits[i])
      }
    }
    return children;
  }
  orgNames(orgUnit) {
    var names = [orgUnit.name.trim().toLowerCase()];
    var av = this.getOrgAttribute(orgUnit, this.spellingsAttributeID);
    if (av && av.value) {
      var otherSpellings = av.value.split(',');
      if (otherSpellings && otherSpellings.length) {
        for (var i = 0; i < otherSpellings.length; i++) {
          if (otherSpellings[i].trim) {
            names.push(otherSpellings[i].trim().toLowerCase());
          }
        }
      }
    }
    return names;
  }
  getOrgAttribute(orgUnit, attributeId) {
    if (orgUnit.attributeValues) {
      for (var a = 0; a < orgUnit.attributeValues.length; a++) {
        var av = orgUnit.attributeValues[a]
        if (av['attribute']['id'] == attributeId) {
          return av;
        }
      }
    }
  }

}

export default OrgUnitTreeMapper;
