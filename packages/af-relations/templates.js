/**
 * Created by dmitry on 2/27/16.
 */
Meteor.startup(function() {
    Template.afInputRelations.onCreated(function () {
        var self=this,
            data = self.data,
            formData = data.formData,
            myColName=AutoForm.getFormCollection()._name;
            //do all the subscriptions related to the other side of  relationship
            self.subscribe('jspAfRel-otherSide',myColName,data.rel.relName);
            if(data.rel.otherSide.side==='heavy')
                self.subscribe('jspAfRel-otherHeavySide', data.myDocId,myColName,data.rel.relName);
    });

    Template.afInputRelations.helpers({
        jsonValue:function(){
            return this.value.get();
        },
        getAttr: function () {
            return _.omit(this.atts, 'data-schema-key')
        },
        schemaKey: function () {
            return this.atts['data-schema-key']
        },
        getValue: function () {
            return this.value.get()
        },
        getSelItemCount: function () {  //returns number of items referenced on the other side of a relationship
            var rel=this.rel;
            if (rel.mySide.side === 'heavy') {
                //references are imbeded on this side in this field
                return this.value.get().count
            } else {  //references imbeded on the other side.
                var sel={};
                sel[rel.heavykey]={$in:[this.docId]};
                return rel.otherSide.collection.find(sel).count()
            }
        },
        getCursor: function (kw/*type*/) {
            var type=kw.hash.type,
                rel=this.rel,
                value = this.value.get();
            if (rel.mySide.side === 'heavy') {
                if (type === 'selItems') {
                    return rel.otherSide.collection.find({_id: {$in: value}})
                } else {
                    return rel.otherSide.collection.find({_id: {$nin: value}})
                }
            } else {
                var sel={};
                sel[rel.heavyKey]={$in:[this.docId]};
                var ids= rel.otherSide.collection.find(sel).fetch();
                if (type === 'selItems') {
                    return rel.otherSide.collection.find({_id: {$in:ids}})
                } else {
                    return rel.otherSide.collection.find({_id: {$nin: ids}})
                }
            }
        }
    });

    Template.afInputRelations.events({
        'click #avail-sel': function (e, t) {
            $('#chev-avail').click();
        },
        'click #sel-sel': function (e, t) {
            $('#chev-sel').click();
        },
        'click #chev-sel,#chev-avail': function (e, t) {
            var el= e.target;
            if ($(el).hasClass('glyphicon-chevron-down')) {
                $(el).removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
            } else if ($(el).hasClass('glyphicon-chevron-up')) {
                $(el).removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
            }
        },
        'click .reactive-table tbody tr': function (e, t) {
            var rel = t.data.rel,
                oldVal = value('get') || [],
                self=this,
                tableEl = $(e.target).closest('reactive-table');

            function value(action, val) {
                if (action === 'get') {
                    return (rel.mySide.side === 'heavy') ?
                        t.data.value.get() :
                        rel.otherSide.collection.findOne({_id: self._id}).fetch()[rel.heavyKey]
                } else {
                    if (rel.mySide.side === 'heavy') {
                        t.data.value.set(val)
                    } else {
                        var modifier = {};
                        modifier[rel.heavyKey] = val;
                        rel.otherSide.collection.update({_id: self._id}, modifier)
                    }
                }
            }

            var id = (rel.mySide.side === 'heavy') ? self._id : t.data.docId;
            if ($(tableEl).attr('id') === 'sel-items-table') {
                //if clicked row in selected items table, then, remove from selected
                oldVal = _.reject(oldVal, function (oldId) {
                    return oldId === id
                })
            } else {
                /*var newItem = {
                    _id: id,
                    userId: Meteor.userId(),
                    time: Date.now()
                };*/
                oldVal.items.push(id)
            }
            value('set', oldVal);
        }
    });

//now we can register the field and relax
    AutoForm.addInputType('relations', {
        template: 'afInputRelations',
        valueOut: function () {
            return this.val();
        },
        contextAdjust: function (context) {
            //digest relationships names into data relevant to whatever side of relationship the form's collection is
            var relName= context.atts.relName || context.atts['data-schema-key'];
            context.rel =_.defaults(
                {relName:relName},
                jspAfRelations.getRightSide(AutoForm.getFormCollection(), relName)
            );
            context.heavyKey=jspAfRelations.getRel(relName).heavySide.key || relName;
            context.formData = AutoForm.getCurrentDataForForm();
            context.docId=context.formData.doc?context.formData.doc._id:0;
            context.value = new ReactiveVar(context.value || []);
            return context;
        }
    });
})
