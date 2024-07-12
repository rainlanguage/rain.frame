import { getFrameMetadata } from 'frog/next'
import type { Metadata } from 'next'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const frameTags = await getFrameMetadata(
    `${process.env.VERCEL_URL || 'http://localhost:3000'}/api`,
  )
  return {
    other: frameTags,
  }
}

export default function Home() {
  return (
    <main className={styles.main}>
      <div>
        <button style={{ borderRadius: '10px', padding: '20px' }}>deploy strat</button>
      </div>
    </main>
  )
}
