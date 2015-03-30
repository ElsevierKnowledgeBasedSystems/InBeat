var ObjectTaxonomy = function(){

	var Attribute = require('../model/attribute');
    var AggregationTaxonomy = require('../model/aggregation-taxonomy');
	var ValuePropagation = require('./object-propagation');

	_preorder = function(o, value){
		if(o && o.name && o.value && o.value!==0)
        value['d_o_'+o.name] = o.value?o.value:0;
		for (var i in o.children) {
			_preorder(o.children[i],value);
		}
	};

	_objectAttributesTaxonomy = function(accountId, objectId, parentObjectId, flat, callback){
		// Attribute.getDistinctEntityValues(accountId, 'lod', function(err, lods){
			Attribute.findAllByObjectParentObjectId(accountId, objectId, parentObjectId, function(err, attrs){
                AggregationTaxonomy.findById(accountId, function(err, aggregationTaxonomy){
					if(err || !aggregationTaxonomy || !aggregationTaxonomy.content || aggregationTaxonomy.conten==="") {
						// console.log(err);
                        callback(err, null);
                        return;
					} else {
                        var taxonomy = JSON.parse(aggregationTaxonomy.content);
						var result = [];
						var attrCount = attrs.length;
						if(attrCount<=0){
							var ress = {};
							ress.objectId = objectId;
							ress.parentObjectId = parentObjectId;
							if(flat){
								var vector = {};
								_preorder(taxonomy, vector);
								// for (lod = 0; lod < lods.length; lod++) {
        //                             vector["d_r_" + lods[lod].substring(lods[lod].lastIndexOf('/') + 1).replace(/\./g,"_")] = 0;
								// }
							}
							ress.taxonomy = vector;
							result.push(ress);
							callback(null, result);
                            return;
						}
						for(var attr in attrs){
                            (function(attri){
                                ValuePropagation.propagate(taxonomy, attrs[attri].entities, function(err, tax){
                                    var ress = {};
                                    ress.objectId = attrs[attri].objectId;
                                    ress.parentObjectId = attrs[attri].parentObjectId;
                                    if(flat){
                                        var vector = {};
                                        _preorder(tax, vector);
                                        tax = vector;
                                        // for(lod=0;lod<lods.length;lod++){
                                        //     tax["d_r_"+lods[lod].substring(lods[lod].lastIndexOf('/')+1).replace(/\./g,"_")] = 0;
                                        // }
                                        for(e=0;e<attrs[attri].entities.length;e++){
											if(attrs[attri] && attrs[attri].entities && attrs[attri].entities[e] && attrs[attri].entities[e].lod){
												tax["d_r_"+attrs[attri].entities[e].lod.substring(attrs[attri].entities[e].lod.lastIndexOf('/')+1).replace(/\./g,"_")] = 1;
                                            }
                                        }
                                    }
                                    ress.taxonomy = tax;
                                    result.push(ress);
                                    if(--attrCount<=0) {
                                        callback(null, result);
                                    }
                                });
                            })(attr);
						}
					}
				});
			});
		// });
	};

	return {
		objectAttributesTaxonomy: _objectAttributesTaxonomy
	};
}();
module.exports = ObjectTaxonomy;