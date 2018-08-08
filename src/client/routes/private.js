'use strict';

/*********************************************
 * consists private routes which requires valid auth token
 ********************************************/

import React from 'react';
import { Route, IndexRoute, IndexRedirect } from 'react-router';
import { injectAsyncReducer } from '../redux-store/index';
import { checkAuth } from '../services/public/login';
import { showLoading } from 'react-redux-loading-bar';

// To create separate bundle at runtime
if (typeof require.ensure === "undefined") {
    require.ensure = require('node-ensure');
}

// export routes
const Private = (store) => {

    const loadingIndicator = (nextState, replace) => {
        store.dispatch(showLoading());
        checkAuth(nextState, replace);
    };

    return (<Route path="/" onChange={(nextState, replace) => { loadingIndicator(nextState, replace); }}
        onEnter={(nextState, replace) => { loadingIndicator(nextState, replace); }} getComponent={(nextState, cb) => {
            require.ensure([], () => {
                injectAsyncReducer(store, 'header', require('../app/private/header/reducer').default);
                cb(null, require('../app/private/index').default)
            })
        }}>
        <IndexRedirect to="/dashboard" />

        <Route path="/dashboard(/:screen)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/dashboard').default)
            })
        }}>
        </Route>

        <Route path="/livestock(/:detail)(/:subdetail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                injectAsyncReducer(store, 'livestock', require('../app/private/livestock/reducer').default);
                cb(null, require('../app/private/livestock').default)
            })
        }}></Route>

        <Route path="/envd(/:detail)(/:subdetail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                injectAsyncReducer(store, 'eNVD', require('../app/private/envd/reducer').default);
                cb(null, require('../app/private/envd').default)
            })
        }}></Route>

        <Route path="/importdesk(/:detail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/livestock/components/import-desk/import_index').default)
            })
        }}></Route>

        <Route path="/editprofile" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                injectAsyncReducer(store, 'authUser', require('../app/private/contact/reducer').default);
                cb(null, require('../app/private/contact').default)
            })
        }}></Route>

        <Route path="/contact(/:detail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/contact').default)
            })
        }}></Route>

        <Route path="/company(/:detail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/company').default)
            })
        }}></Route>

        <Route path="/property(/:detail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/property').default)
            })
        }}></Route>

        <Route path="/pasturecomposition(/:detail)" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/property/components/pasturecomposition_display').default)
            })
        }}></Route>

        <Route path="/feed">
            <IndexRedirect to="/feed/setup" />

            <Route path="/feed/setup(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/feed/setup').default)
                })
            }}></Route>


            <Route path="/feed/record" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/feed/record').default)
                })
            }}></Route>

        </Route>


        <Route path="/usersetup" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/usersetup').default)
            })
        }}>

            <Route path="/usersetup/species" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/usersetup/species/index').default)
                })
            }}>
            </Route>
        </Route>

        <Route path="/adminsetup" getComponent={(nextState, cb) => {
            require.ensure([], () => {
                cb(null, require('../app/private/setup').default)
            })
        }}>

            <Route path="/adminsetup/species(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/species_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/breed(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/breed_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/maturity(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/maturity_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/speciestype(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/speciestype_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/gender(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/gender_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/propertytype(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/propertytype_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/uom(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/uom_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/uomconversion(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/uomconversion_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/servicetype(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/servicetype_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/breedtype(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/breedtype_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/dosebymeasure" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/dosebymeasure_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/enclosuretype(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/enclosuretype_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/chemicalcategory(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/chemicalcategory_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/livestockcolour(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/livestockcolour_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/treatmenttype(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/treatmenttype_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/treatmentmethod(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/treatmentmethod_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/group(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/group_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/deathreason(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/deathreason_index').default)
                })
            }}>
            </Route>
            <Route path="/adminsetup/accreditationprogram(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/AccreditationProgram_index').default)
                })
            }}>
            </Route>
            <Route path="/setup/chemicalproduct(/:detail)" getComponent={(nextState, cb) => {
                require.ensure([], () => {
                    cb(null, require('../app/private/setup/components/chemicalproduct/chemicalproduct_index').default)
                })
            }}>
            </Route>
        </Route>

    </Route>);
}

export default Private;