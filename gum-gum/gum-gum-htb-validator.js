/**
 * @author:    Partner
 * @license:   UNLICENSED
 *
 * @copyright: Copyright (c) 2017 by Index Exchange. All rights reserved.
 *
 * The information contained within this document is confidential, copyrighted
 * and or a trade secret. No part of this document may be reproduced or
 * distributed in any form or by any means, in whole or in part, without the
 * prior written permission of Index Exchange.
 */

'use strict';

////////////////////////////////////////////////////////////////////////////////
// Dependencies ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var Inspector = require('../../../libs/external/schema-inspector.js');

////////////////////////////////////////////////////////////////////////////////
// Main ////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

/* =============================================================================
 * STEP 0 | Config Validation
 * -----------------------------------------------------------------------------
 * This file contains the necessary validation for the partner configuration.
 * This validation will be performed on the partner specific configuration object
 * that is passed into the wrapper. The wrapper uses an outside library called
 * schema-insepctor to perform the validation. Information about it can be found here:
 * https://atinux.fr/schema-inspector/.
 */
function partnerValidator(configs) {
    var result = Inspector.validate({
        type: 'object',
        properties: {
            xSlots: {
                type: 'object',
                properties: {
                    '*': {
                        type: 'object',
                        exec: function (schema, post) {
                            if (!((post.hasOwnProperty('inScreen') || post.hasOwnProperty('inSlot')))) {
                                this.report('Need either inScreen or inSlot');
                            }

                            return post;
                        },
                        properties: {
                            inScreen: {
                                optional: true,
                                type: 'string',
                                exactLength: 8
                            },
                            inSlot: {
                                optional: true,
                                type: 'integer',
                                minLength: 0
                            },
                            sizes: {
                                type: 'array',
                                minLength: 1,
                                uniqueness: true,
                                items: {
                                    type: 'array',
                                    items: {
                                        type: 'integer'
                                    }
                                }
                            },
                            iriscat: {
                                optional: true,
                                type: 'string',
                                minLength: 1
                            },
                            irisid: {
                                optional: true,
                                type: 'string',
                                minLength: 1
                            }
                        }
                    }
                }
            }
        }
    }, configs);

    if (!result.valid) {
        return result.format();
    }

    return null;
}

module.exports = partnerValidator;
