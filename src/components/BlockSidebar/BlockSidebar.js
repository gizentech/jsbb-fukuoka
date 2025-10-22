import { useState } from 'react';
import Link from 'next/link';
import styles from './BlockSidebar.module.css';

export default function BlockSidebar({ tournaments = [] }) {
  const [openBlocks, setOpenBlocks] = useState({ tournamentInfo: true });

  const recentTournaments = tournaments.slice(0, 5);

  console.log('BlockSidebar received tournaments:', tournaments.length);
  console.log('Recent tournaments:', recentTournaments);

  const fukuokaBlocks = [
    {
      id: 'kyochiku',
      title: '京築',
      branches: [
        { id: 'yukuhashi', name: '行橋支部' },
        { id: 'kanda', name: '苅田支部' },
        { id: 'buzen', name: '豊前支部' }
      ]
    },
    {
      id: 'kitakyushu',
      title: '北九州',
      branches: [
        { id: 'kitakyushu', name: '北九州支部' }
      ]
    },
    {
      id: 'chikuho',
      title: '筑豊',
      branches: [
        { id: 'chuen', name: '中遠支部' },
        { id: 'chokukuwa', name: '直鞍支部' },
        { id: 'kahan', name: '嘉飯支部' },
        { id: 'tagawa', name: '田川支部' }
      ]
    },
    {
      id: 'higashi-fukuoka',
      title: '東福岡',
      branches: [
        { id: 'koga', name: '古賀支部' },
        { id: 'kasuya', name: '糟屋支部' },
        { id: 'munakata', name: '宗像支部' }
      ]
    },
    {
      id: 'fukuoka',
      title: '福岡',
      branches: [
        { id: 'fukuoka', name: '福岡支部' },
        { id: 'chikushi', name: '筑紫支部' },
        { id: 'kasuga', name: '春日支部' },
        { id: 'onojo', name: '大野城支部' }
      ]
    },
    {
      id: 'kita-chikugo',
      title: '北筑後',
      branches: [
        { id: 'asakura', name: '朝倉支部' },
        { id: 'yame', name: '八女支部' },
        { id: 'ukiha', name: '浮羽支部' },
        { id: 'ogori', name: '小郡支部' }
      ]
    },
    {
      id: 'kurume',
      title: '久留米',
      branches: [
        { id: 'kurume', name: '久留米支部' }
      ]
    },
    {
      id: 'minami-chikugo',
      title: '南筑後',
      branches: [
        { id: 'yanagawa', name: '柳川支部' },
        { id: 'chikugo', name: '筑後支部' },
        { id: 'omuta', name: '大牟田支部' },
        { id: 'okawa-oki', name: '大川大木支部' }
      ]
    }
  ];

  const toggleBlock = (blockId) => {
    setOpenBlocks(prev => {
      const isCurrentlyOpen = prev[blockId];
      if (isCurrentlyOpen) {
        return {};
      } else {
        return { [blockId]: true };
      }
    });
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <div className={styles.scrollArea}>
          <div className={styles.blockItem}>
            <button
              className={styles.header}
              onClick={() => toggleBlock('tournamentInfo')}
            >
              <h3>大会情報</h3>
            </button>
            {openBlocks.tournamentInfo && (
              <ul className={styles.branchList}>
                {recentTournaments.length > 0 ? (
                  recentTournaments.map((tournament) => (
                    <li key={tournament.id}>
                      <Link href={`/tournaments/tournament/${tournament.id}`} className={styles.branchLink}>
                        {tournament.title}
                      </Link>
                    </li>
                  ))
                ) : (
                  <li className={styles.branchLink}>
                    <div className={styles.noData}>大会情報がありません</div>
                  </li>
                )}
              </ul>
            )}
          </div>

          {fukuokaBlocks.map((block) => (
            <div key={block.id} className={styles.blockItem}>
              <button
                className={styles.blockTitle}
                onClick={() => toggleBlock(block.id)}
              >
                {block.title}
              </button>
              {openBlocks[block.id] && (
                <ul className={styles.branchList}>
                  {block.branches.map((branch) => (
                    <li key={branch.id}>
                      <Link href={`/tournaments/${block.id}/${branch.id}`} className={styles.branchLink}>
                        {branch.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
