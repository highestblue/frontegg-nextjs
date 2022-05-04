import { GetServerSideProps } from 'next'
import { useAuthUser, withSSRSession } from '@frontegg/nextjs';


export default function ForceSession({ ssrSession }) {
  const user = useAuthUser();
  return <div>
    <h1>Force SSR Session</h1>

    <br/>
    hooks:  {JSON.stringify(user)}
    <br/>
    SSR Session: {ssrSession ? JSON.stringify(ssrSession) : 'No Session'}
  </div>
}


export const getServerSideProps: GetServerSideProps = withSSRSession((context, session) => {
  return { props: { ssrSession: session } }
});