import bcrypt from 'bcryptjs'
import pg from 'pg'

const DATABASE_URL =
  'postgresql://neondb_owner:npg_2EVzjARl6DNP@ep-bold-sky-b3c1198e-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

const EMAIL = 'siddhant@dreamkeykol.com'
const NEW_PASSWORD = 'siddhant@dreamkeykol'

async function main() {
  const salt = await bcrypt.genSalt(10)
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, salt)
  console.log('Generated hash:', passwordHash)

  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()

  const res = await client.query(
    `UPDATE "users" SET "passwordHash" = $1 WHERE email = $2 RETURNING id, email`,
    [passwordHash, EMAIL]
  )

  if (res.rowCount === 0) {
    console.error(`❌ No user found with email: ${EMAIL}`)
  } else {
    console.log(`✅ Password updated for: ${res.rows[0].email} (id: ${res.rows[0].id})`)
  }

  await client.end()
}

main().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
