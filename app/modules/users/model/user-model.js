'use strict';

module.exports = function(sequelize, DataTypes){

    var USER = sequelize.define('user', {
          NAME  : DataTypes.STRING
        , EMAIL : {
              type: DataTypes.STRING
            , allowNull : false
            , unique    : true
            , validate  : {
                isEmail : {
                    msg : 'Email is not valid'
                }
            }
        }
        , PASSWORD : {
              type: DataTypes.STRING
            , allowNull : false
        }
        , RESETTOKEN   : DataTypes.STRING
        , RESETEXPIRES : DataTypes.DATE
    }, {
        classMethods  : {
            associate : function(models){
                USER.hasMany(models.job_request, {
                    foreignKey    : {
                        name      : 'JOB_ID'
                      , allowNull : true
                      }
                });
                USER.hasMany(models.job, {
                    onDelete    : 'cascade'
                  , foreignKey  : {
                      name      : 'USER_ID'
                    , allowNull : false
                    }
                });
                USER.belongsTo(models.user_status, { foreignKey : 'USER_STATUS' });
            }
      }
    });

    return USER;
}
