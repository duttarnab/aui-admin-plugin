import React, { useState, useEffect } from 'react'
import MaterialTable from 'material-table'
import { useHistory } from 'react-router-dom'
import { Paper } from '@material-ui/core'
import { Badge } from 'reactstrap'
import { connect } from 'react-redux'
import GluuDialog from '../../../../app/routes/Apps/Gluu/GluuDialog'
import { Card, CardBody, FormGroup } from '../../../../app/components'
import GluuRibbon from '../../../../app/routes/Apps/Gluu/GluuRibbon'
import CustomScriptDetailPage from './CustomScriptDetailPage'
import GluuCustomScriptSearch from '../../../../app/routes/Apps/Gluu/GluuCustomScriptSearch'
import GluuViewWrapper from '../../../../app/routes/Apps/Gluu/GluuViewWrapper'
import applicationStyle from '../../../../app/routes/Apps/Gluu/styles/applicationstyle'
import {
  deleteCustomScript,
  getCustomScriptByType,
  setCurrentItem,
  getCustomScripts,
} from '../../redux/actions/CustomScriptActions'
import {
  hasPermission,
  buildPayload,
  SCRIPT_READ,
  SCRIPT_WRITE,
  SCRIPT_DELETE,
} from '../../../../app/utils/PermChecker'
import {
  LIMIT_ID,
  LIMIT,
  PATTERN,
  PATTERN_ID,
  TYPE,
  TYPE_ID,
  FETCHING_SCRIPTS,
  SEARCHING_SCRIPTS,
} from '../../common/Constants'
import { useTranslation } from 'react-i18next'

function ScriptListTable({ scripts, loading, dispatch, permissions }) {
  const { t } = useTranslation()
  const history = useHistory()
  const userAction = {}
  const options = {}
  const myActions = []
  const [item, setItem] = useState({})
  const [modal, setModal] = useState(false)
  const pageSize = localStorage.getItem('paggingSize') || 10
  const [limit, setLimit] = useState(pageSize)
  const [pattern, setPattern] = useState(null)
  const [selectedScripts, setSelectedScripts] = useState(scripts)
  const [type, setType] = useState('PERSON_AUTHENTICATION')
  const toggle = () => setModal(!modal)

  function makeOptions() {
    options[LIMIT] = parseInt(limit)
    if (pattern) {
      options[PATTERN] = pattern
    }
    if (type && type != '') {
      options[TYPE] = type
    }
  }
  useEffect(() => {
    makeOptions()
    buildPayload(userAction, FETCHING_SCRIPTS, options)
    dispatch(getCustomScripts(userAction))
  }, [])
  useEffect(() => {
    setSelectedScripts(
      scripts.filter(
        (script) => script.scriptType == document.getElementById(TYPE_ID).value,
      ),
    )
  }, [scripts])
  if (hasPermission(permissions, SCRIPT_WRITE)) {
    myActions.push((rowData) => ({
      icon: 'edit',
      iconProps: {
        color: 'primary',
        id: 'editCustomScript' + rowData.inum,
      },
      tooltip: `${t('messages.edit_script')}`,
      onClick: (event, entry) => handleGoToCustomScriptEditPage(entry),
      disabled: false,
    }))
  }
  if (hasPermission(permissions, SCRIPT_READ)) {
    myActions.push({
      icon: () => (
        <GluuCustomScriptSearch
          limitId={LIMIT_ID}
          limit={limit}
          typeId={TYPE_ID}
          patternId={PATTERN_ID}
          handler={handleOptionsChange}
        />
      ),
      tooltip: `${t('messages.advanced_search')}`,
      iconProps: { color: 'primary' },
      isFreeAction: true,
    })
  }
  if (hasPermission(permissions, SCRIPT_READ)) {
    myActions.push({
      icon: 'refresh',
      tooltip: `${t('messages.refresh')}`,
      iconProps: { color: 'primary' },
      isFreeAction: true,
      onClick: () => {
        makeOptions()
        buildPayload(userAction, SEARCHING_SCRIPTS, options)
        dispatch(getCustomScriptByType(userAction))
      },
    })
  }
  if (hasPermission(permissions, SCRIPT_DELETE)) {
    myActions.push((rowData) => ({
      icon: 'delete',
      iconProps: {
        color: 'secondary',
        id: 'deleteCustomScript' + rowData.inum,
      },
      tooltip: `${t('messages.delete_script')}`,
      onClick: (event, row) => handleCustomScriptDelete(row),
      disabled: false,
    }))
  }
  if (hasPermission(permissions, SCRIPT_WRITE)) {
    myActions.push({
      icon: 'add',
      tooltip: `${t('messages.add_script')}`,
      iconProps: { color: 'primary' },
      isFreeAction: true,
      onClick: () => handleGoToCustomScriptAddPage(),
    })
  }
  function handleOptionsChange() {
    setLimit(document.getElementById(LIMIT_ID).value)
    setPattern(document.getElementById(PATTERN_ID).value)
    setType(document.getElementById(TYPE_ID).value)
    setSelectedScripts(
      scripts.filter(
        (script) => script.scriptType == document.getElementById(TYPE_ID).value,
      ),
    )
  }
  function handleGoToCustomScriptAddPage() {
    return history.push('/adm/script/new')
  }
  function handleGoToCustomScriptEditPage(row) {
    dispatch(setCurrentItem(row))
    return history.push(`/adm/script/edit:` + row.inum)
  }
  function handleCustomScriptDelete(row) {
    setItem(row)
    toggle()
  }
  function onDeletionConfirmed(message) {
    buildPayload(userAction, message, item.inum)
    dispatch(deleteCustomScript(userAction))
    history.push('/adm/scripts')
    toggle()
  }
  return (
    <Card>
      <GluuRibbon title={t('titles.scripts')} fromLeft />
      <CardBody>
        <FormGroup row />
        <FormGroup row />
        <GluuViewWrapper canShow={hasPermission(permissions, SCRIPT_READ)}>
          <MaterialTable
            components={{
              Container: (props) => <Paper {...props} elevation={0} />,
            }}
            columns={[
              { title: `${t('fields.inum')}`, field: 'inum' },
              { title: `${t('fields.name')}`, field: 'name' },
              {
                title: `${t('options.enabled')}`,
                field: 'enabled',
                type: 'boolean',
                render: (rowData) => (
                  <Badge color={rowData.enabled == 'true' ? 'primary' : 'info'}>
                    {rowData.enabled ? 'true' : 'false'}
                  </Badge>
                ),
              },
            ]}
            data={selectedScripts}
            isLoading={loading}
            title=""
            actions={myActions}
            options={{
              search: false,
              searchFieldAlignment: 'left',
              selection: false,
              pageSize: pageSize,
              rowStyle: (rowData) => ({
                backgroundColor: rowData.enabled ? '#33AE9A' : '#FFF',
              }),
              headerStyle: applicationStyle.tableHeaderStyle,
              actionsColumnIndex: -1,
            }}
            detailPanel={(rowData) => {
              return <CustomScriptDetailPage row={rowData} />
            }}
          />
        </GluuViewWrapper>
        {hasPermission(permissions, SCRIPT_DELETE) && (
          <GluuDialog
            row={item}
            handler={toggle}
            modal={modal}
            subject="script"
            onAccept={onDeletionConfirmed}
          />
        )}
      </CardBody>
    </Card>
  )
}

const mapStateToProps = (state) => {
  return {
    scripts: state.customScriptReducer.items,
    loading: state.customScriptReducer.loading,
    permissions: state.authReducer.permissions,
  }
}
export default connect(mapStateToProps)(ScriptListTable)
