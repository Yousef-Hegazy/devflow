"use cache";

import { searchAnswers } from "@/actions/answers";
import AnswerCard from "@/components/cards/AnswerCard";
import DataRenderer from "@/components/DataRenderer";
import AppPagination from "@/components/navigation/AppPagination";
import { EMPTY_ANSWERS } from "@/lib/constants/states";
import { AnswersFilterType } from "@/lib/types/filters";
import { PaginationSearchParams } from "@/lib/types/pagination";

type Props = {
  userId: string;
  searchParams: PaginationSearchParams<AnswersFilterType>;
};

const UserAnswersTab = async ({ userId, searchParams }: Props) => {
  const { p, ps, filter } = searchParams;

  const answersRes = await searchAnswers({
    page: Number(p) || 1,
    pageSize: Number(ps) || 10,
    userId: userId,
    filter: filter || "latest",
  });

  return (
    <>
      <DataRenderer
        data={"error" in answersRes ? [] : [answersRes]}
        empty={EMPTY_ANSWERS}
        success={!("error" in answersRes)}
        error={
          "error" in answersRes ? { message: answersRes.error } : undefined
        }
        render={([res]) =>
          res.rows.map((answer) => (
            <AnswerCard key={answer.$id} answer={answer} userId={userId} isCompact isLink />
          ))
        }
      />

      {/* Pagination */}
      <div className="mt-10 flex w-full justify-center">
        <AppPagination
          page={Number(searchParams.p) || 1}
          totalItems={"error" in answersRes ? 1 : answersRes.total}
          pageSize={Number(searchParams.ps) || 50}
        />
      </div>
    </>
  );
};

export default UserAnswersTab;
