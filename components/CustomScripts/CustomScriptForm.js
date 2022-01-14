import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  Col,
  InputGroup,
  CustomInput,
  Form,
  FormGroup,
  Input,
} from '../../../../app/components'
import GluuLabel from '../../../../app/routes/Apps/Gluu/GluuLabel'
import GluuInumInput from '../../../../app/routes/Apps/Gluu/GluuInumInput'
import GluuProperties from '../../../../app/routes/Apps/Gluu/GluuProperties'
import Counter from '../../../../app/components/Widgets/GroupedButtons/Counter'
import GluuCommitFooter from '../../../../app/routes/Apps/Gluu/GluuCommitFooter'
import GluuCommitDialog from '../../../../app/routes/Apps/Gluu/GluuCommitDialog'
import GluuTooltip from '../../../../app/routes/Apps/Gluu/GluuTooltip'
import { SCRIPT } from '../../../../app/utils/ApiResources'
import { useTranslation } from 'react-i18next'

function CustomScriptForm({ item, scripts, handleSubmit }) {
  const { t } = useTranslation()
  const [init, setInit] = useState(false)
  const [modal, setModal] = useState(false)
  const [scriptTypeState, setScriptTypeState] = useState(item.scriptType)
  const scriptTypes = [...new Set(scripts.map((anItem) => anItem.scriptType))]
  function activate() {
    if (!init) {
      setInit(true)
    }
  }
  function toggle() {
    setModal(!modal)
  }

  function submitForm() {
    toggle()
    document.getElementsByClassName('UserActionSubmitButton')[0].click()
  }

  function getPropertiesConfig(entry) {
    if (
      entry.configurationProperties &&
      Array.isArray(entry.configurationProperties)
    ) {
      return entry.configurationProperties.map((e) => ({
        key: e.value1,
        value: e.value2,
      }))
    } else {
      return []
    }
  }

  const formik = useFormik({
    initialValues: {
      name: item.name,
      description: item.description,
      scriptType: item.scriptType,
      programmingLanguage: item.programmingLanguage,
      level: item.level,
      script: item.script,
      aliases: item.aliases,
      moduleProperties: item.moduleProperties,
      configurationProperties: item.configurationProperties,
    },
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Mininum 2 characters').required('Required!'),
      description: Yup.string(),
      scriptType: Yup.string()
        .min(2, 'Mininum 2 characters')
        .required('Required!'),
      programmingLanguage: Yup.string()
        .min(3, 'This value is required')
        .required('Required!'),
      script: Yup.string().required('Required!'),
    }),

    onSubmit: (values) => {
      values.level = item.level
      values.moduleProperties = item.moduleProperties
      if (!!values.configurationProperties) {
        values.configurationProperties = values.configurationProperties
          .filter((e) => e != null)
          .filter((e) => Object.keys(e).length !== 0)
          .map((e) => ({
            value1: e.key || e.value1,
            value2: e.value || e.value2,
            hide: false,
          }))
      }
      if (typeof values.enabled == 'object') {
        if (values.enabled.length > 0) {
          values.enabled = true
        } else {
          values.enabled = false
        }
      }
      const result = Object.assign(item, values)
      const reqBody = { customScript: result }
      handleSubmit(reqBody)
    },
  })

  function locationTypeChange(value) {
    if (value != '') {
      if (!item.moduleProperties) {
        item.moduleProperties = []
      }

      if (
        item.moduleProperties.filter(
          (candidate) => candidate.value1 === 'location_type',
        ).length > 0
      ) {
        item.moduleProperties.splice(
          item.moduleProperties.findIndex(
            (el) => el.value1 === 'location_type',
          ),
          1,
        )
      }
      item.moduleProperties.push({
        value1: 'location_type',
        value2: value,
        description: '',
      })
    }
  }

  function usageTypeChange(value) {
    if (value != '') {
      if (!item.moduleProperties) {
        item.moduleProperties = []
      }

      if (
        item.moduleProperties.filter((ligne) => ligne.value1 === 'usage_type')
          .length > 0
      ) {
        item.moduleProperties.splice(
          item.moduleProperties.findIndex((row) => row.value1 === 'usage_type'),
          1,
        )
      }
      item.moduleProperties.push({
        value1: 'usage_type',
        value2: value,
        description: '',
      })
    }
  }

  function onLevelChange(level) {
    item.level = level
  }

  return (
    <Form onSubmit={formik.handleSubmit}>
      {item.inum && (
        <GluuInumInput
          label="fields.inum"
          name="inum"
          lsize={3}
          rsize={9}
          value={item.inum}
          doc_category={SCRIPT}
        />
      )}
      <GluuTooltip doc_category={SCRIPT} doc_entry="name">
        <FormGroup row>
          <GluuLabel label="fields.name" required />
          <Col sm={9}>
            <Input
              placeholder={t('placeholders.name')}
              id="name"
              valid={!formik.errors.name && !formik.touched.name && init}
              name="name"
              defaultValue={item.name}
              onKeyUp={activate}
              onChange={formik.handleChange}
            />
            {formik.errors.name && formik.touched.name ? (
              <div style={{ color: 'red' }}>{formik.errors.name}</div>
            ) : null}
          </Col>
        </FormGroup>
      </GluuTooltip>
      <GluuTooltip doc_category={SCRIPT} doc_entry="description">
        <FormGroup row>
          <GluuLabel label="fields.description" />
          <Col sm={9}>
            <InputGroup>
              <Input
                placeholder={t('placeholders.description')}
                valid={
                  !formik.errors.description &&
                  !formik.touched.description &&
                  init
                }
                id="description"
                defaultValue={item.description}
                onChange={formik.handleChange}
              />
            </InputGroup>
          </Col>
        </FormGroup>
      </GluuTooltip>
      {scriptTypeState === 'PERSON_AUTHENTICATION' && (
        <GluuTooltip doc_category={SCRIPT} doc_entry="aliases">
          <FormGroup row>
            <GluuLabel label={t('Select SAML ACRS')} />
            <Col sm={9}>
              <Input
                type="select"
                name="aliases"
                id="aliases"
                defaultValue={item.aliases}
                multiple
                onChange={formik.handleChange}
              >
                <option value="urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocol">
                  urn:oasis:names:tc:SAML:2.0:ac:classes:InternetProtocol
                </option>
                <option value="urn:oasis:names:tc:SAML:2.0:ac:classes:Password">
                  urn:oasis:names:tc:SAML:2.0:ac:classes:Password
                </option>
                <option value="urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport">
                  urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport
                </option>
              </Input>
            </Col>
          </FormGroup>
        </GluuTooltip>
      )}
      <GluuTooltip doc_category={SCRIPT} doc_entry="scriptType">
        <FormGroup row>
          <GluuLabel label="fields.script_type" required />
          <Col sm={9}>
            <InputGroup>
              <CustomInput
                type="select"
                id="scriptType"
                name="scriptType"
                defaultValue={item.scriptType}
                onChange={(e) => {
                  setScriptTypeState(e.target.value)
                  formik.setFieldValue('scriptType', e.target.value)
                }}
              >
                <option value="">{t('options.choose')}...</option>
                {scriptTypes.map((itemCandidate, index) => (
                  <option key={index} value={itemCandidate}>
                    {itemCandidate}
                  </option>
                ))}
              </CustomInput>
            </InputGroup>
            {formik.errors.scriptType && formik.touched.scriptType ? (
              <div style={{ color: 'red' }}>{formik.errors.scriptType}</div>
            ) : null}
          </Col>
        </FormGroup>
      </GluuTooltip>
      <GluuTooltip doc_category={SCRIPT} doc_entry="programmingLanguage">
        <FormGroup row>
          <GluuLabel label="fields.programming_language" required />
          <Col sm={9}>
            <InputGroup>
              <CustomInput
                type="select"
                id="programmingLanguage"
                name="programmingLanguage"
                defaultValue={item.programmingLanguage}
                onChange={formik.handleChange}
              >
                <option value="">{t('Choose')}...</option>
                <option>PYTHON</option>
                <option>JAVASCRIPT</option>
              </CustomInput>
            </InputGroup>
            {formik.errors.programmingLanguage &&
            formik.touched.programmingLanguage ? (
              <div style={{ color: 'red' }}>
                {formik.errors.programmingLanguage}
              </div>
            ) : null}
          </Col>
        </FormGroup>
      </GluuTooltip>
      <GluuTooltip doc_category={SCRIPT} doc_entry="locationType">
        <FormGroup row>
          <GluuLabel label="fields.location_type" />
          <Col sm={9}>
            <InputGroup>
              <CustomInput
                type="select"
                id="location_type"
                name="location_type"
                defaultValue={
                  !!item.moduleProperties &&
                  item.moduleProperties.filter(
                    (i) => i.value1 === 'location_type',
                  ).length > 0
                    ? item.moduleProperties.filter(
                        (it) => it.value1 === 'location_type',
                      )[0].value2
                    : undefined
                }
                onChange={(e) => {
                  locationTypeChange(e.target.value)
                }}
              >
                <option value="">{t('options.choose')}...</option>
                <option value="ldap">{t('Database')}</option>
                <option value="file">{t('File')}</option>
              </CustomInput>
            </InputGroup>
          </Col>
        </FormGroup>
      </GluuTooltip>
      {scriptTypeState === 'PERSON_AUTHENTICATION' && (
        <GluuTooltip doc_category={SCRIPT} doc_entry="usage_type">
          <FormGroup row>
            <GluuLabel label="Interactive" />
            <Col sm={9}>
              <InputGroup>
                <CustomInput
                  type="select"
                  id="usage_type"
                  name="usage_type"
                  defaultValue={
                    !!item.moduleProperties &&
                    item.moduleProperties.filter(
                      (vItem) => vItem.value1 === 'usage_type',
                    ).length > 0
                      ? item.moduleProperties.filter(
                          (kItem) => kItem.value1 === 'usage_type',
                        )[0].value2
                      : undefined
                  }
                  onChange={(e) => {
                    usageTypeChange(e.target.value)
                  }}
                >
                  <option value="">{t('options.choose')}...</option>
                  <option value="interactive">interactive</option>
                  <option value="service">service</option>
                  <option value="both">both</option>
                </CustomInput>
              </InputGroup>
            </Col>
          </FormGroup>
        </GluuTooltip>
      )}
      <GluuTooltip doc_category={SCRIPT} doc_entry="level">
        <FormGroup row>
          <GluuLabel label="fields.level" />
          <Col sm={9}>
            <Counter
              counter={item.level}
              onCounterChange={(level) => onLevelChange(level)}
            />
            <Input type="hidden" id="level" defaultValue={item.level} />
          </Col>
        </FormGroup>
      </GluuTooltip>
      <GluuProperties
        compName="configurationProperties"
        label="fields.custom_properties"
        formik={formik}
        keyPlaceholder={t('placeholders.enter_property_key')}
        valuePlaceholder={t('placeholders.enter_property_value')}
        options={getPropertiesConfig(item)}
      ></GluuProperties>
      <GluuTooltip doc_category={SCRIPT} doc_entry="script">
        <FormGroup row>
          <GluuLabel label={t('Script')} size={2} required />
          {formik.errors.script && formik.touched.script ? (
            <div style={{ color: 'red' }}>{formik.errors.script}</div>
          ) : null}
          <Col sm={10}>
            <Input
              placeholder={t('Script')}
              valid={!formik.errors.script && !formik.touched.script && init}
              type="textarea"
              rows={20}
              id="script"
              name="script"
              defaultValue={item.script}
              onChange={formik.handleChange}
            />
          </Col>
        </FormGroup>
      </GluuTooltip>
      <GluuTooltip doc_category={SCRIPT} doc_entry="enabled">
        <FormGroup row>
          <GluuLabel label="options.enabled" size={3} />
          <Col sm={1}>
            <Input
              id="enabled"
              name="enabled"
              onChange={formik.handleChange}
              type="checkbox"
              defaultChecked={item.enabled}
            />
          </Col>
        </FormGroup>
      </GluuTooltip>
      <GluuTooltip doc_category={SCRIPT} doc_entry="moduleProperties">
        <FormGroup row>
          <Input
            type="hidden"
            id="moduleProperties"
            defaultValue={item.moduleProperties}
          />
        </FormGroup>
      </GluuTooltip>
      <GluuCommitFooter saveHandler={toggle} />
      <GluuCommitDialog
        handler={toggle}
        modal={modal}
        onAccept={submitForm}
        formik={formik}
      />
    </Form>
  )
}

export default CustomScriptForm
