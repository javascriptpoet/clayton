/**
 * Created by dmitry on 2/28/16.
 */
    debugger;
var s='';
Sample=new Mongo.Collection('sample');
Sample.insert({title:'whatzup'});
if(Meteor.isServer) {
    // debugger
    Meteor.publish('jspAfRel-otherHeavySide', function (myDocId, myColName, relName) {
        var sides = jspAfRelations.getRightSide(myColName, relName),
            heavySide = sides.mySide.side === 'heavy' ? sides.mySide : sides.otherSide,
            key = (heavySide.key || 'relations') + '.' + relName,
            sel1 = {}, sel2 = {};
        sel2[key] = {$in: [myDocId]};
        sel1[key] = {exists: true};
        var sel = {$and: [sel1, sel2]};
        return heavySide.collection.find(sel, {fields: {_id:1}});
    });
}

//collection used to store data for server to client reactivity
OtherHeavySide=new Mongo.Collection('jspAfRel-otherHeavySide');

jspAfRelations={
    _rels:{},
    /**
     * @Method getRightSide
     * given a collection, returns an object with sides renamed 'mySide' and 'otherSide'
     * @param col
     * @param relName
     */
    getRightSide:function(col,relName){
        var rel=this.getRel(relName);
        if(!rel){
            throw(new Meteor.Error('RelError','relationship '+relName+' is not defined'))
        }
        colName=((typeof col) === 'string')?col:col._name;
        if(rel.heavySide.collection._name===colName){
            return {mySide:rel.heavySide,otherSide:rel.lightSide}
        }else if(rel.lightSide.collection._name===colName){
            return {mySide:rel.lightSide,otherSide:rel.heavySide}
        }else{
            throw(new Meteor.Error('RelError','collection '+colName+' is not part of relationship '+relName))
        }
    },

    /**
     * @Method addRel(name<string>,options<object>)
     *  registers a relationship between two enteties. This step allows prebuilding of the tables and suscriptions
     *  and improves performance. Only 'collection' type is supported now. relates one collection
     *  to another. one side (heavy side) must be chosen  to imbed keys indexed to docs on the other side (light side).
     *  The indexes are stored in the afFieldRelations fieldr of the heavy side. The corresponding field on the light
     *  side is just a placeholder to display the field on the form. However, a number of relationships can be combined under
     *  the same field and a collection can be the heavy side for ne relationship and the light side for another
     *
     * @param name required*  the unique name of the relationship. it is used to select it in a schema
     *
     * @param options required
     *  any additional properties of a relationship. Some required and some are optional
     *      heavySide:{
     *          collection:<mongo collection obj>  required
     *          key:<string> optional name of the jspAfRelations field. If not supplied, defaults to 'relations'
     *          label:<string> optional collection name is used if not provided
     *          table:<Object> {table of the heavySide} optional
     *              parameters of the table displayed in the form. If omited, defaults to just 'ID' field in the table
     *             This are the same parameters as defined in aldeed:meteor-tabular. do not
     *              include table name. It is generated automatically as jsp{rel.name}-{rel.lightSide.collection}
     *      }
     *      heavySide: ... mirrow image of light side
     *      icon: <string> optional
     *          font awesome icon class. This is the icon that will be displayed for this collection for this relationship.
     *
     *
     *
     *
     */
    addRel:function(name,options){
        function getSide(side,howHeavy) {
            var table = side.table || {};
            columns = _.union(table.columns || [], [
                {data: '_id', title: 'ID'}
            ]);
            s=s+'1';
            return {
                table:new Tabular.Table({
                    name: s,
                    collection: Sample,
                    columns: [
                        {data: "title", title: "Title"}
                    ]
                }),
               /* table: new Tabular.Table(_.extend({
                    name: 'jsp-' + name + '-' + howHeavy,
                    collection:side.collection,
                    columns: _.map(table.columns, function (column) {
                        if (column.template) {
                            var createdCell = function (node, cellData, rowData) {
                                $(node).html = '';
                                return Blaze.renderWithData(Template[column.template], {
                                    value: cellData,
                                    doc: rowData
                                }, node)
                            }

                        };
                        return _.extend(_.omit(column, 'template'), {
                            createdCell: createdCell,
                        });
                    })
                }, _.omit(table,['name','collection','columns']))),*/
                collection:side.collection,
                colName: side.collection._name,
                icon:side.icon,
                label:side.label || side.collection._name,
                side:howHeavy
            }
        }
        options = _.clone(options);
        this._rels[name] = {
            relName: name,
            lightSide: getSide(options.lightSide, 'light'),
            heavySide: getSide(options.heavySide, 'heavy')
        };
    },
    getRel:function(name){
            return this._rels[name]
    }
}
