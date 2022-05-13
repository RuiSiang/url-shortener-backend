const Koa = require('koa')
const Router = require('koa-router')
const json = require('koa-json')
const bodyparser = require('koa-bodyparser')
const validator = require('validator')
const moment = require('moment')
const { Bigtable } = require('@google-cloud/bigtable')
const crypto = require('crypto')

require('dotenv').config()

const app = new Koa()
const router = new Router()
const bigTableClient = new Bigtable()
const bigTableInstance = bigTableClient.instance(process.env.INSTANCE_ID)
const table = bigTableInstance.table(process.env.TABLE_ID)

const initBigTable = async () => {
  const [tableExists] = await table.exists()
  if (!tableExists) {
    console.log(`Creating table ${process.env.TABLE_ID}`)
    await table.create()
    await table.createFamily(process.env.COLUMN_FAMILY_ID, {
      rule: {
        age: {
          seconds: 10,
          nanos: 0,
        },
      }
    })
  }
  console.log('Big table instance initialized.')
}
initBigTable()

app.use(bodyparser())
app.use(json())

router.post('/urlgen', async (ctx) => {
  if (!ctx.request.body.url || !ctx.request.body.expiry) {
    ctx.status = 400
    ctx.body = 'ERR_MISSING_REQUIRED_PARAMS'
    return
  }
  if (!validator.isURL(ctx.request.body.url)) {
    ctx.status = 400
    ctx.body = 'ERR_INVALID_URL'
    return
  }
  if (!(typeof (ctx.request.body.expiry == 'number') && ctx.request.body.expiry >= 60 && ctx.request.body.expiry <= 1209600)) {
    ctx.status = 400
    ctx.body = 'ERR_INVALID_EXPIRY'
    return
  }
  const hash = crypto.createHash('sha256').update(ctx.request.body.url).digest('base64')
  const row = {
    key: hash.slice(0, 8),
    data: {
      [process.env.COLUMN_FAMILY_ID]: {
        value: ctx.request.body.url,
      }
    }
  }
  await table.insert(row)
  ctx.body = hash.slice(0, 8)
})

router.get('/:link', async (ctx) => {
  if (!validator.isLength(ctx.params.link, { min: 8, max: 8 })) {
    ctx.status = 400
    ctx.body = 'ERR_INVALID_LINK'
    return
  }

  try {
    const [row] = await table.row(ctx.params.link).get()
    ctx.body = (row.data)
  } catch (err) {
    ctx.status = 404
  }
  //ctx.redirect(row.data[process.env.COLUMN_FAMILY_ID].value[0].value)
})

app.use(router.routes())
app.listen(parseInt(process.env.PORT || '3000'))