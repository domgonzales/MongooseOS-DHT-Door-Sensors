/*
 * Generated file - do not edit.
 * Command: /mongoose-os/fw/tools/gen_sys_config.py --c_name=sys_ro_vars --c_const_char=true --dest_dir=/fwbuild-volumes/1.18/apps/empty-1.18/esp8266/build_contexts/build_ctx_243886606/build/gen/ /mongoose-os/fw/src/sys_ro_vars_schema.yaml
 */

#ifndef SYS_RO_VARS_H_
#define SYS_RO_VARS_H_

#include "mgos_config.h"

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */

struct sys_ro_vars {
  const char *mac_address;
  const char *arch;
  const char *fw_version;
  const char *fw_timestamp;
  const char *fw_id;
};


const struct mgos_conf_entry *sys_ro_vars_schema();

#ifdef __cplusplus
}
#endif /* __cplusplus */

#endif /* SYS_RO_VARS_H_ */
