import moment from 'moment';  
import SimpleSchema from 'simpl-schema';
SimpleSchema.extendOptions(['autoform', 'index', 'unique', 'denyInsert', 'denyUpdate']);

import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export const Schemas = {};
export const Collections = {};

Collections.Texts = new Mongo.Collection('texts');
Collections.Terms = new Mongo.Collection('terms');
Collections.Credits = new Mongo.Collection('credits');
Collections.Faq = new Mongo.Collection('faq');

Collections.Timers = new Mongo.Collection('timers');
Collections.Sessions = new Mongo.Collection('sessions');

Collections.Contact = new Mongo.Collection('contact');
Collections.Analytics = new Mongo.Collection('analytics');
Collections.Settings = new Mongo.Collection('settings');

Collections.Pricing = new Mongo.Collection('pricing');
Collections.EmailsTmpl = new Mongo.Collection('emailstmpl');
Collections.Push = new Mongo.Collection('push');

Schemas.UserCountry = new SimpleSchema({
    name: {
        type: String
    },
/*     code: {
        type: String,
        regEx: /^[A-Z]{2}$/
    } */
});
Schemas.UserProfile = new SimpleSchema({
	firstName: {
		type: String,
		optional: true,
		autoform:{
			label:false
		}				
	},
	lastName: {
			type: String,
			optional: true,
		autoform:{
			label:false
		}			
	},
	website: {
		type: String,
		regEx: SimpleSchema.RegEx.Url,
		optional: true,
		autoform:{
			label:false
		}							
	},
	phone: {
		type: String,
		optional: true,
		autoform:{
			label:false
		}							
	},
  avatar: {
    type: String,
		optional: true,
    autoform: {
			type: 'cloudinary'
/*       afFieldInput: {
        type: 'cloudinary'
      },      
			afQuickField: {
        type: 'cloudinary'
      }, */
    }
  },
	agree:{
		type: Object,
		optional:  true
	},
	'agree.date':{
		type: Date,
		optional:  true
	},
	'agree.checked':{
		type: Boolean,
		optional:  true
	},
	
});
Schemas.User = new SimpleSchema({
	username: {
		type: String,
		// For accounts-password, either emails or username is required, but not both. It is OK to make this
		// optional here because the accounts-password package does its own validation.
		// Third-party login packages may not require either. Adjust this schema as necessary for your usage.
		optional: true
	},
	emails: {
		type: Array,
		// For accounts-password, either emails or username is required, but not both. It is OK to make this
		// optional here because the accounts-password package does its own validation.
		// Third-party login packages may not require either. Adjust this schema as necessary for your usage.
		optional: true,
	},
	"emails.$": {
		type: Object,

	},
	"emails.$.address": {
		type: String,
		regEx: SimpleSchema.RegEx.Email,

	},
	"emails.$.verified": {
		type: Boolean,

	},
	createdAt: {
		type: Date
	},
	profile: {
		type: Schemas.UserProfile,
		optional: true
	},
	// Make sure this services field is in your schema if you're using any of the accounts packages
	services: {
		type: Object,
		optional: true,
		blackbox: true,
		autoform:{
			omit:true
		}
	},
	// Add `roles` to your schema if you use the meteor-roles package.
	// Option 1: Object type
	// If you specify that type as Object, you must also specify the
	// `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
	// Example:
	// Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
	// You can't mix and match adding with and without a group since
	// you will fail validation in some cases.
	roles: {
		type: Object,
		optional: true,
		blackbox: true,
		autoform:{
			omit:true
		}
	},
	// Option 2: [String] type
	// If you are sure you will never need to use role groups, then
	// you can specify [String] as the type
	// roles: {
			// type: Array,
			// optional: true
	// },
	// 'roles.$': {
			// type: String
	// },
	// In order to avoid an 'Exception in setInterval callback' from Meteor
	heartbeat: {
		type: Date,
		optional: true,
		autoform:{
			omit:true
		}
	}
});
Meteor.users.attachSchema(Schemas.User);

Schemas.Texts = new SimpleSchema({
  'title': {
    type: String,
  },
  'item': {
    type: String,
  },
  'name': {
    type: String,
		optional: true,
  },
  'published': {
    type: Boolean,
		optional: true,
  },
  'intro': {
    type: String,
		optional: true,
  },
  more: {
    type: String,
		optional: true,
  },
  'about': {
    type: Object,
		optional: true
  },
  'about.h2': {
    type: String,
		optional: true,
  },
  'about.text': {
    type: String,
		optional: true,
		autoform: {
			rows: 3,
		},
  },  	
	'about.picture': {
    type: String,
		optional: true,
  },
  'solutions': {
    type: Object,
		optional: true
  },
  'solutions.h2': {
    type: String,
		optional: true,
  },
  'solutions.text': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },  
	'solutions.text2': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },  
	'solutions.text3': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },  
	'solutions.text4': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },
  'solutions.picture': {
    type: String,
		optional: true,
		autoform: {
			rows: 1,
		},
  },  
	'solutions.picture2': {
    type: String,
		optional: true,
		autoform: {
			rows: 1,
		},
  },
  'solutions2': {
    type: Object,
		optional: true
  },
  'solutions2.h2': {
    type: String,
		optional: true,
  },
  'solutions2.text': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },
  'solutions2.picture': {
    type: String,
		optional: true,
		autoform: {
			rows: 1,
		},
  },
  'contact': {
    type: Object,
		optional: true
  },
  'contact.h2': {
    type: String,
		optional: true,
  },
  'contact.text': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },
  'video': {
    type: Object,
		optional: true
  },
  'video.embed': {
    type: String,
		optional: true,
		autoform: {
			rows: 3,
		},
  },	
  'video.text': {
    type: String,
		optional: true,
		autoform: {
			rows: 3,
		},
  },	
	images: {
		type: Array,
		optional: true,
	},	
	'images.$': {
		type: Object,
		optional: true,
	},
  'images.$.text': {
    type: String,
		optional: true,
  },
  'images.$.image': {
    type: String,
		optional: true,
    autoform: {
      afFieldInput: {
        type: 'cloudinary'
      }
    }
  },
	'project': {
		type: Object,
		optional: true,
	},
	'project.intro': {
		type: String,
		optional: true,
	},
	'project.url': {
		type: String,
		optional: true,
	},
	'project.desc': {
		type: String,
		optional: true,
		autoform: {
			rows: 3,
		},
	},
	itemText: {
		type: Array,
		optional: true,
	},	
	'itemText.$': {
		type: Object,
		optional: true,
	},
	'itemText.$.id': {
		type: String,
		optional: true,
	},
/* 	'itemText.$.title': {
		type: String,
		optional: true,
	}, */
	'itemText.$.text': {
		type: String,
		optional: true,
		autoform: {
			rows: 3,
		},
	},
	'itemText.$.urlname': {
		type: String,
		optional: true
	},
	'itemText.$.url': {
		type: String,
		optional: true
	},
	'itemText.$.image': {
		type: String,
		optional: true,
    autoform: {
      afFieldInput: {
        type: 'cloudinary'
      }
    }
	},
});
Collections.Texts.attachSchema(Schemas.Texts);
Collections.Texts.allow({
  insert: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  }
});

Schemas.Terms = new SimpleSchema({
  type: {
    type: String,
		unique: true
  },
  text: {
    type: String,
		autoform: {
			rows: 6,
		},
  },
	createdAt: {
		type: Date,
		index: true,
		autoValue: function(){
			return new Date();
		},
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
});
Collections.Terms.attachSchema(Schemas.Terms);
Collections.Terms.allow({
  insert: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  }
});

Schemas.Credits = new SimpleSchema({
	text: {
		type: String,
	},	
	link: {
		type: String,
	},			
	picture: {
		type: String,
		optional: true,
	},
	userId: {
		type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			if (this.isInsert) {
				return Meteor.userId();
			}
		},	
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	createdAt: {
		type: Date,
		optional: true,	
		autoValue: function(){
			if (this.isInsert)
				return new Date();
		},
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	updatedAt: {
		type: Date,
		optional: true,	
		autoValue: function(){
			if (this.isUpdate)
				return new Date();
		},
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
});
Collections.Credits.allow({
  insert: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  }
});

Schemas.Faq = new SimpleSchema({
	question: {
		type: String,
		optional: false,
	},
	answer: {
		type: String,
		optional: false,
		autoform: {
			afFieldInput: {
				type: "textarea",
				rows: 4
			}
		}
	},
	createdAt:{
		type: Date,
		index: true,
		optional: true,
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true
		},
	},
	updated: {
		type: Date,
		optional: true,
		autoform: {
			value: new Date()
		},
		autoform: {
			omit: true
		},
	},
});
Collections.Faq.attachSchema(Schemas.Faq);
Collections.Faq.allow({
  insert: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  }
});

Schemas.Contact = new SimpleSchema({
	contactId: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	formId: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	userId: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	name: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
					type: "text"
			},
			placeholder: '* Name',
			afFormGroup: {
				label: false
			}
		},
	},
	email: {
		type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Email,
		autoform: {
			afFieldInput: {
				type: "email"
			},
			placeholder: 'email',
			afFormGroup: {
				label: false
			}
		},
		
	},
	phone: {
		type: String,
		optional: true,
		regEx: /^[0-9-]{2,30}$/,
		autoform: {
			afFieldInput: {
					type: "tel"
			},
			placeholder: 'Phone 201-123-4567',
			afFormGroup: {
				label: false
			}
		},
	},
	estimate: {
		type: Number,
		optional: true,
	},	
	breakdown: {
		type: Object,
		optional: true,
		blackbox: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},	
	related: {
		type: String,
		label: "Related",
		optional: true,
		autoform: {
			afFieldInput: {
					type: "text"
			},
			afFormGroup: {
				label: "related to url or id"
			}
		}
	},
	reported: {
		type: String,
		optional: true
	},
	questionType: {
		type: String,
		label: "Your question",
		optional: true,
		autoform: {
			type: "select",
			options: function () {
				return [
					{label: 'report', value: 'report'},
					{label: 'support', value: 'support'},
					{label: 'beta signUp', value: 'beta'},
					{label: 'join our team', value: 'join our team'},
					{label: 'uninstall', value: 'uninstall'},
					{label: 'other', value: 'other'}
				];
			},
			afFormGroup: {
				label: false
			}
		}
	},
	reason: {
		type: Array,
		optional: true,
		autoform: {
			type: 'select-checkbox',
			omit: true,
			options: function () {
				return [
					{label: "Slows down my computer", value: "slows down"  },
					{label: "I don't want to create an account", value: "account"},
					{label: "Not enough features in the free product", value: "features"},
					{label: "Doesn't work on my favorite websites", value: "not working on websites"},
				];
			},
			afFormGroup: {
				label: false
			}
		}
	},
	'reason.$': String,
	question: {
		type: String,
		label: "Your question",
		optional: true,
		autoform: {
			placeholder: "Your question",
			afFieldInput: {
					type: "textarea",
					rows: 6
			}
		}
	},
	websites: {
		type: String,
		optional: true,
		autoform: {
			placeholder: "Can you give us some site names where it doesnt work?",
		}
	},
	question: {
		type: String,
		label: "Your question",
		optional: true,
		autoform: {
			placeholder: "Your question",
			afFieldInput: {
					type: "textarea",
					rows: 6
			}
		}
	},
/* 	survey: {
		type: Object,
		optional: true,	
	},
	'survey.$': {
		type: Array,
		optional: true,	
	},
	'survey.$.question': {
		type: String,
		optional: true,	
	},
	'survey.$.placeholder': {
		type: String,
		optional: true,	
	},
	'survey.$.answer': {
		type: String,
		optional: true,	
	}, */
	createdAt: {
		type: Date,
		index: true,
		autoValue: function(){
			return new Date();
		},
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	device: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	referrer: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},	
	abtest: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	details: {
		type: Object,
		optional: true,
		blackbox: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},	
	geo: {
		type: Object,
		optional: true,
		blackbox: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	seen:{
		type: Array,
		optional: true
	},
	'seen.$':{
		type: String
	}
});
Collections.Contact.attachSchema(Schemas.Contact);	
Collections.Contact.allow({
  insert: function () {
		return true;
  },
  update: function () {
		console.log('[Collections.Contact]', this, Roles.userIsInRole(this.userId, ['admin'], 'admGroup'));
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  }
});

Schemas.Analytics = new SimpleSchema({
	userId: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	ip: {
		type: Array,
		optional: true
	},
	'ip.$': {
		type: String
	},
	platform: {
		type: Array,
		optional: true
	},
	'platform.$': {
		type: String
	},
	referrer: {
		type: Array,
		optional: true
	},
	'referrer.$': {
		type: String
	},
	device: {
		type: Array,
		optional: true
	},
	'device.$': {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	referrer: {
		type: Array,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},	
	'referrer.$': {
		type: String
	},
	abtest: {
		type: String,
		optional: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	details: {
		type: Object,
		optional: true,
		blackbox: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},	
	geo: {
		type: Array,
		optional: true
	},
	'geo.$': {
		type: Object,
		optional: true,
		blackbox: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	seen:{
		type: Array,
		optional: true
	},
	'seen.$':{
		type: String
	},
	createdAt: {
		type: Date,
		index: true,
		autoValue: function(){
			return new Date();
		},
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
	visitedAt: {
		type: Date,
		index: true,
		autoform: {
			afFieldInput: {
				type: "hidden"
			},
			afFormGroup: {
				label: false,
			}
		},
	},
});
Collections.Analytics.attachSchema(Schemas.Analytics);	
Collections.Analytics.allow({
  insert: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function () {
		console.log('[Collections.Contact]', this, Roles.userIsInRole(this.userId, ['admin'], 'admGroup'));
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function () {
		if (Roles.userIsInRole(this.userId, ['admin'], 'admGroup')) 
			return true;
  }
});
	
Schemas.Pricing = new SimpleSchema({
	'order':{
		type: Number,
		optional: true,
	},
  'btn': {
    type: String,
		optional: true,
		autoform: {
			 type: 'select-radio',
			 options: function (){return[{label:"free",value:'default'},{label:"pro",value:'info'},{label:"team",value:'success'},{label:"enterprise",value:'danger'}]}
		}
  },
  'title': {
    type: String,
/* 		autoform: {
			 type: 'select-radio',
			 options: function (){return[{label:"free",value:'free'},{label:"pro",value:'pro'},{label:"team",value:'team'},{label:"enterprise",value:'enterprise'}]}
		} */
  },  
	'id': {
		label: 'Stripe ID',
    type: String,
  },
  'price': {
    type: Number,
		//decimal: true,
		optional: true,
  },
  'features': {
    type: String,
		optional: true,
		autoform: {
			rows: 6,
		},
  },
  'sale.promo': {
    type: String,
		optional: true,
		autoform: {
			max: 7
		},
  },
  'sale.text': {
    type: String,
		optional: true,
		autoform: {
			max: 30,
			rows: 3,
		},
  },
  'sale.price': {
    type: Number,
		//decimal: true,
		optional: true,
  },
  'createdAt': {
    type: Date,
    label: 'Date',
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    },
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
	"userId": {
    type: String,
		optional: true,
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      if (this.isInsert) {
        return Meteor.userId();
      }
    },
    autoform: {
			omit: true,
      options: function () {
        _.map(Meteor.users.find().fetch(), function (user) {
          return {
            label: user.emails[0].address,
            value: user._id
          };
        });
      }
    }
  },
});
Collections.Pricing.attachSchema(Schemas.Pricing);
Collections.Pricing.allow({
  insert: function (userId, doc) {
		if (Roles.userIsInRole(doc.userId, ['admin'], 'admGroup')) 
			return true;
  },
  update: function (userId, doc) {
		//console.log('allow rules', Roles.userIsInRole(doc.userId, ['admin'], 'admGroup'), doc, this.userId, userId);
		if (Roles.userIsInRole(doc.userId, ['admin'], 'admGroup')) 
			return true;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(doc.userId, ['admin'], 'admGroup')) 
			return true;
  }
});

Schemas.Timers = new SimpleSchema({
  title: {
    type: String
  },
	color: {
		type: String,
		optional: true,
		autoform: {
         type: 'select'
		},
		allowedValues: [
			 'white',
			 'silver',
			 'gray',
			 'black',
			 'red',
			 'maroon',
			 'yellow',
			 'olive',
			 'lime',
			 'green',
			 'aque',
			 'teal',
			 'blue',
			 'navy',
			 'fuchsia',
			 'purple'
		],
	},	
	tags: {
    type: Array,
		optional: true,
		autoform: {
			type: 'tags'
		}
  }, 
	'tags.$': {
    type: String,
		optional: true,
		autoform: {
			type: 'tags'
		}
  },    
	intervalId: {
		type: Number,
		optional: true,
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }		
	},		
	timeStarted: {
		type: Date,
		optional: true,
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }		
	},	
	timeFinished: {
		type: Date,
		optional: true,
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }		
	},
	timeSpent: {
		type: Number,
		optional: true,
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }		
	},
	daily: {
		type: Array,
		optional: true,
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
	},
	'daily.$': {
		type: Object
	},
	'daily.$._id': {
		type: Date
	},		
	'daily.$.date': {
		type: Date
	},	
	'daily.$.count': {
		type: Number
	},
	'daily.$.spent': {
		type: Number
	},
	'daily.$.notes': {
		type: String
	},
	publicTimer:{
		type: Boolean,
		optional: true,
	},
	useGPS:{
		type: Boolean,
		optional: true,
	},
	archived: {
		type: Boolean,
		optional: true,
		autoform:{
			omit: true,
		}
	},
	archivedAt: {
    type: Date,
    label: 'Date',
		optional: true,
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
  createdAt: {
    type: Date,
		index: -1,
    label: 'Date',
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    },
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
  updatedAt: {
    type: Date,
		index: -1,
    label: 'Date',
    autoValue: function () {
			return new Date();
    },
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
  userId: {
    type: String,
		index: true,
    autoform: {
      type: "hidden",
      label: false
    },
    regEx: SimpleSchema.RegEx.Id,
    defaultValue: function () {
			console.log('collection userId', this);
      if (Meteor.isClient && this.isInsert) {
        return Meteor.userId();
      }
    },
  },
	gps:{
		type: Object,
		optional: true,
		blackbox: true,
		autoform:{
			omit:true
		}	
	}
});
Collections.Timers.allow({
  insert: function (userId, doc) {
		return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
    return doc.userId === userId;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
    return doc.userId === userId;
  }
});

Schemas.Sessions = new SimpleSchema({
  timerId: {
    type: String,
		index: true,
		autoform:{
      type: "hidden",
      label: false
		}
  },
	start: {
		type: Date,	
		autoform:{
			type: 'datetime-local',
		}
	},
	stop: {
		type: Date,
		optional: true,
		autoform:{
			type: 'datetime-local',
		}
	},
	notes: {
		type: String,
		optional: true
	},  
	createdAt: {
    type: Date,
		index: -1,
    label: 'Date',
    autoValue: function () {
      if (this.isInsert) {
        return new Date();
      }
    },
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
  },	
	updatedAt: {
    type: Date,
		index: -1,
    label: 'Date',
    autoValue: function () {
      if (this.isUpdate) {
        return new Date();
      }
    },
    autoform: {
			omit: true,
      afFieldInput: {
        type: 'hidden'
      }
    }
  },
  userId: {
    type: String,
		index: true,
    autoform: {
			//omit: true,
      type: "hidden",
      label: false
    },
    regEx: SimpleSchema.RegEx.Id,
    defaultValue: function () {
			console.log('collection userId', this);
      if (Meteor.isClient && this.isInsert) {
        return Meteor.userId();
      }
    },
  },

});
Collections.Sessions.allow({
  insert: function (userId, doc) {
		return true;
  },
  update: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
    return doc.userId === userId;
  },
  remove: function (userId, doc) {
		if (Roles.userIsInRole(userId, ['admin'], 'admGroup')) 
			return true;
    return doc.userId === userId;
  }
});

Schemas.Monthly = new SimpleSchema({
	createdAt:{
		type: Date,
		index: -1,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform:{
			omit: true
		}
	},
	month: {
		type: String,
		optional: true,
		autoform: {
			type: 'select',
			options: function (){return[
				{label:"All",value: ""},
				{label:"Jan",value: "01"},
				{label:"Feb",value: "02"},
				{label:"Mar",value: "03"},
				{label:"Apr",value: "04"},
				{label:"May",value: "05"},
				{label:"Jun",value: "06"},
				{label:"Jul",value: "07"},
				{label:"Aug",value: "08"},
				{label:"Sep",value: "09"},
				{label:"Oct",value: "10"},
				{label:"Nov",value: "11"},
				{label:"Dec",value: "12"},
			]}
		}
	},
	year: {
		type: String,
		optional: true,
		autoform: {
			type: 'select',
			options: function (){return[
				{label:"All",value: ""},
				{label:"2017",value: "2017"},
				{label:"2018",value: "2018"},
				{label:"2019",value: "2019"},
				{label:"2020",value: "2020"},
				{label:"2021",value: "2021"},
			]}
		}
	}
});

Schemas.EmailsTmpl = new SimpleSchema({
	id: {
		type: String,
		autoform: {
			type: 'select',
			options: function (){
				return[
					{label:'signup', value:'signup'},
					{label:'question', value:'question'},
					{label:'complain', value:'complain'},
					{label:'other', value:'other'},
					{label:'liked', value:'liked'},
					{label:'menthioned', value:'menthioned'},
					{label:'paid', value:'paid'},
					{label:'cancelled', value:'cancelled'},
				]}
		}
	},  
	subject: {
    type: String,
  },
	text: {
		type: String,
			optional: true,
			autoform: {
				rows: 6,
			},
	},
	createdAt: {
		type: Date,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
			afFieldInput: {
				type: 'hidden'
			}
		}
	},
	userId: {
		type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			if (this.isInsert) {
				return Meteor.userId();
			}
		},
		autoform: {
			omit: true,
			options: function () {
				_.map(Meteor.users.find().fetch(), function (user) {
					return {
						label: user.emails[0].address,
						value: user._id
					};
				});
			}
		}
	},
});
Collections.EmailsTmpl.attachSchema(Schemas.EmailsTmpl);

Schemas.Push = new SimpleSchema({
	type: {
		type: String,
	},
	createdAt: {
		type: Date,
		index: -1,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},
	userId: {
		type: String,
		index: true,
		unique: true,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			if (Meteor.isClient && this.isInsert) {
				return Meteor.userId();
			}
		},
	},
	username: {
		type: String,
		optional: true,
	},
	device: {
		type: Array,
		optional: true
	},
	'device.$':{
		type: Object
	},
	'device.$.token':{
		type: String,
		optional: true
	},
	'device.$.cordova':{
		type: String,
		optional: true
	},
	'device.$.platform':{
		type: String,
		optional: true
	},
	'device.$.model':{
		type: String,
		optional: true
	},
	'device.$.uuid':{
		type: String,
		optional: true
	},
	'device.$.version':{
		type: String,
		optional: true
	},
	'device.$.vendor':{
		type: String,
		optional: true
	},
	'device.$.createdAt':{
		type: Date,
		optional: true
	},
	'device.$.caller':{
		type: String,
		optional: true
	},
	pushing: {
		type: Boolean,
		optional: true,
	},
	following: {
		type: Boolean,
		optional: true,
	},
	blocked: {
    type: Boolean,
		optional: true,
  },
	sentAt: {
		type: Date,
		optional: true,
	},  
	sent: {
    type: Number,
    optional: true,
	},
	msg:{
		type: Object,
		optional: true,
		blackbox: true
	},
	details:{
		type: Object,
		optional: true,
		blackbox: true
	},
});
Collections.Push.attachSchema(Schemas.Push);

Schemas.Settings = new SimpleSchema({
	type: {
		type: String,
		unique: true
	},
	enable: {
		type: Boolean,
		optional: true,
	},
	common: {
		type: String,
		optional: true,
	},
	url: {
		type: String,
		optional: true,
	},
	createdAt: {
		type: Date,
		label: 'Date',
		autoValue: function () {
			if (this.isInsert) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},
	updatedAt: {
		type: Date,
		label: 'Date',
		autoValue: function () {
			if (this.isUpdate) {
				return new Date();
			}
		},
		autoform: {
			omit: true,
		}
	},
	userId: {
		type: String,
		optional: true,
		regEx: SimpleSchema.RegEx.Id,
		autoValue: function () {
			if (Meteor.isClient && this.isInsert) {
				return Meteor.userId();
			}
		},
	},
	personal: {
		type: Array,
		optional: true
	},	
	'personal.$': {
		type: Object,
	},
	'personal.$.enable': {
		type: Boolean,
	},
	'personal.$.userId': {
		type: String,
	},
});
